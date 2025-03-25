import axios from 'axios';

const EXECUTION_SERVICE_URL = process.env.EXECUTION_SERVICE_URL || 'http://localhost:3000';

export async function sendTaskToExecutionService(threadId: string, assistantId: string): Promise<string> {
  if (!EXECUTION_SERVICE_URL) {
    console.error('EXECUTION_SERVICE_URL is not defined');
    throw new Error('Execution service URL is not configured');
  }

  try {
    const response = await axios.post(`${EXECUTION_SERVICE_URL}/task/execute`, {
      threadId,
      assistantId
    });

    if (response.data.error === false) {
      return response.data.data.proofOfTask;
    } else {
      throw new Error(response.data.message || 'Unknown error from execution service');
    }
  } catch (error) {
    console.error('Execution service error:', error);
    throw error;
  }
}