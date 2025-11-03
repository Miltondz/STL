/**
 * WebGL Context Pool - Manages shared WebGL contexts across multiple canvases
 * Prevents "Too many active WebGL contexts" browser limit errors
 */

interface PooledContext {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  inUse: boolean;
  lastUsed: number;
}

class GLContextPool {
  private contexts: PooledContext[] = [];
  private readonly maxContexts = 8; // Most browsers support 8-16, use 8 to be safe
  private readonly contextTimeout = 60000; // 60s before cleaning unused contexts

  /**
   * Get or create a WebGL context for rendering
   */
  acquireContext(width: number, height: number): { canvas: HTMLCanvasElement; gl: WebGLRenderingContext | WebGL2RenderingContext } {
    // Try to find an available context
    const available = this.contexts.find(ctx => !ctx.inUse);
    
    if (available) {
      available.inUse = true;
      available.lastUsed = Date.now();
      
      // Resize canvas if needed
      if (available.canvas.width !== width || available.canvas.height !== height) {
        available.canvas.width = width;
        available.canvas.height = height;
        available.gl.viewport(0, 0, width, height);
      }
      
      return { canvas: available.canvas, gl: available.gl };
    }

    // Create new context if under limit
    if (this.contexts.length < this.maxContexts) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) throw new Error('Failed to create WebGL context');
      
      const pooled: PooledContext = {
        canvas,
        gl,
        inUse: true,
        lastUsed: Date.now(),
      };
      
      this.contexts.push(pooled);
      return { canvas, gl };
    }

    // If at limit, reuse oldest unused context
    const oldest = this.contexts
      .filter(ctx => !ctx.inUse)
      .sort((a, b) => a.lastUsed - b.lastUsed)[0];

    if (oldest) {
      oldest.inUse = true;
      oldest.lastUsed = Date.now();
      oldest.canvas.width = width;
      oldest.canvas.height = height;
      oldest.gl.viewport(0, 0, width, height);
      return { canvas: oldest.canvas, gl: oldest.gl };
    }

    throw new Error('No WebGL contexts available');
  }

  /**
   * Release a context back to the pool
   */
  releaseContext(canvas: HTMLCanvasElement): void {
    const ctx = this.contexts.find(c => c.canvas === canvas);
    if (ctx) {
      ctx.inUse = false;
      ctx.lastUsed = Date.now();
    }
  }

  /**
   * Clean up old unused contexts to free GPU memory
   */
  cleanup(): void {
    const now = Date.now();
    this.contexts = this.contexts.filter(ctx => {
      if (!ctx.inUse && now - ctx.lastUsed > this.contextTimeout) {
        try {
          ctx.gl.getExtension('WEBGL_lose_context')?.loseContext();
        } catch (e) {
          console.warn('Failed to lose context:', e);
        }
        return false;
      }
      return true;
    });
  }

  /**
   * Get current pool stats
   */
  getStats() {
    return {
      total: this.contexts.length,
      inUse: this.contexts.filter(c => c.inUse).length,
      available: this.contexts.filter(c => !c.inUse).length,
      maxContexts: this.maxContexts,
    };
  }
}

export const glContextPool = new GLContextPool();

// Periodic cleanup every 30 seconds
setInterval(() => {
  glContextPool.cleanup();
}, 30000);
