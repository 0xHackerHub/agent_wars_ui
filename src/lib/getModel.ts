// lib/getModel.ts
export async function getModels() {
    try {
      const response = await fetch('/models.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching models.json:', error);
      throw error; // Re-throw to handle in the caller if needed
    }
  }