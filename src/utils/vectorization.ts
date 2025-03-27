import axios from "axios";

/**
 *
 * @param place_id
 * @returns
 */
export async function triggerVectorization(place_id: string) {
  try {
    const response = await axios.post("/api/vectorizeUserProperties", {
      place_id: place_id,
    });

    console.log(
      `Vectorization triggered for place_id: ${place_id}`,
      response.data
    );
    return response.data;
  } catch (error) {
    console.error(
      `Failed to trigger vectorization for place_id: ${place_id}`,
      error
    );
    return null;
  }
}
