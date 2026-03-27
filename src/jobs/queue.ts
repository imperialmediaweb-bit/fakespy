import { Queue, Worker, Job } from 'bullmq';
import { getRedis } from '../lib/redis';
import { logger } from '../lib/logger';

const QUEUE_NAME = 'fakespy-jobs';

let queue: Queue | null = null;
let worker: Worker | null = null;

export function getQueue(): Queue {
  if (!queue) {
    queue = new Queue(QUEUE_NAME, {
      connection: getRedis(),
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 200,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });
  }
  return queue;
}

type JobProcessor = (job: Job) => Promise<void>;

const processors = new Map<string, JobProcessor>();

export function registerJobProcessor(jobType: string, processor: JobProcessor) {
  processors.set(jobType, processor);
}

export function startWorker() {
  if (worker) return;

  worker = new Worker(
    QUEUE_NAME,
    async (job: Job) => {
      const processor = processors.get(job.name);
      if (!processor) {
        logger.warn({ jobName: job.name }, 'No processor found for job');
        return;
      }

      logger.info({ jobId: job.id, jobName: job.name }, 'Processing job');
      await processor(job);
      logger.info({ jobId: job.id, jobName: job.name }, 'Job completed');
    },
    {
      connection: getRedis(),
      concurrency: 5,
    },
  );

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, jobName: job?.name, err }, 'Job failed');
  });

  worker.on('error', (err) => {
    logger.error({ err }, 'Worker error');
  });

  logger.info('Job worker started');
}

export async function addJob(name: string, data: Record<string, unknown>, opts?: { priority?: number; delay?: number }) {
  const q = getQueue();
  return q.add(name, data, opts);
}

export async function stopWorker() {
  if (worker) {
    await worker.close();
    worker = null;
  }
  if (queue) {
    await queue.close();
    queue = null;
  }
}
