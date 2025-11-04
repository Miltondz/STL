const IMAGE_COUNT = 31;
export const PLANET_IMAGE_PATHS = Array.from({ length: IMAGE_COUNT }, (_, i) => `/nodes/planet${(i + 1).toString().padStart(4, '0')}.png`);

const assignedImages = new Map<number, string>();
const proximityThreshold = 150; // Adjust this pixel distance as needed

/**
 * Gets a random planet image for a node, ensuring it's not too close to another node with the same image.
 * @param nodeId The ID of the current node.
 * @param nodes All nodes on the map.
 * @returns A URL to a planet image.
 */
export function getPlanetImageForNode(nodeId: number, nodes: { id: number; x: number; y: number }[]): string {
  if (assignedImages.has(nodeId)) {
    return assignedImages.get(nodeId)!;
  }

  const currentNode = nodes.find(n => n.id === nodeId);
  if (!currentNode) {
    // Fallback to a completely random image if node not found
    return PLANET_IMAGE_PATHS[Math.floor(Math.random() * PLANET_IMAGE_PATHS.length)];
  }

  const forbiddenImages = new Set<string>();

  // Check nodes that are already assigned an image
  for (const [otherNodeId, assignedImage] of assignedImages.entries()) {
    const otherNode = nodes.find(n => n.id === otherNodeId);
    if (otherNode) {
      const distance = Math.sqrt(Math.pow(currentNode.x - otherNode.x, 2) + Math.pow(currentNode.y - otherNode.y, 2));
      if (distance < proximityThreshold) {
        forbiddenImages.add(assignedImage);
      }
    }
  }

  // Find an available image
  let availableImages = PLANET_IMAGE_PATHS.filter(p => !forbiddenImages.has(p));

  // If all images are forbidden (e.g., dense cluster), just use the full list
  if (availableImages.length === 0) {
    availableImages = PLANET_IMAGE_PATHS;
  }

  // Use a seeded random number for deterministic assignment
  const pseudoRandom = (seed: number) => {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const randomIndex = Math.floor(pseudoRandom(nodeId) * availableImages.length);
  const selectedImage = availableImages[randomIndex];

  console.log(`[ImageRegistry] Node ${nodeId}: Selected planet ${selectedImage} (index ${randomIndex}/${availableImages.length})`);
  console.log(`[ImageRegistry] Available images: ${availableImages.length}, Forbidden: ${forbiddenImages.size}`);
  
  assignedImages.set(nodeId, selectedImage);
  return selectedImage;
}

/**
 * Preloads all planet images to prevent flickering.
 */
export function preloadPlanetImages() {
  console.log('[ImageRegistry] Preloading planet images...');
  for (const path of PLANET_IMAGE_PATHS) {
    const img = new Image();
    img.src = path;
  }
  console.log(`[ImageRegistry] ${PLANET_IMAGE_PATHS.length} images preloaded.`);
}

/**
 * Shows current planet assignments for debugging
 */
export function showPlanetAssignments() {
  console.log('[ImageRegistry] Current planet assignments:');
  const imageCount = new Map<string, number>();
  
  for (const [nodeId, imagePath] of assignedImages.entries()) {
    const count = imageCount.get(imagePath) || 0;
    imageCount.set(imagePath, count + 1);
    console.log(`  Node ${nodeId}: ${imagePath}`);
  }
  
  console.log('[ImageRegistry] Image usage summary:');
  for (const [imagePath, count] of imageCount.entries()) {
    console.log(`  ${imagePath}: used ${count} times`);
  }
}

/**
 * Debug function to show planet distribution
 */
export function debugPlanetDistribution() {
  console.log('[ImageRegistry] Planet distribution:');
  const distribution = new Map<string, number>();
  
  for (const [nodeId, imagePath] of assignedImages.entries()) {
    const count = distribution.get(imagePath) || 0;
    distribution.set(imagePath, count + 1);
  }
  
  console.log(`[ImageRegistry] Total nodes with planets: ${assignedImages.size}`);
  console.log(`[ImageRegistry] Unique planets used: ${distribution.size}/${PLANET_IMAGE_PATHS.length}`);
  
  // Mostrar distribución
  for (const [imagePath, count] of distribution.entries()) {
    const planetNumber = imagePath.match(/planet(\d+)\.png/)?.[1];
    console.log(`[ImageRegistry] Planet ${planetNumber}: used ${count} times`);
  }
}

/**
 * Reset planet assignments (useful for new maps)
 */
export function resetPlanetAssignments() {
  assignedImages.clear();
  console.log('[ImageRegistry] Planet assignments reset');
}
