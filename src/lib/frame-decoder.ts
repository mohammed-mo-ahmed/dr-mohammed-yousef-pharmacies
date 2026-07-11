import { Input, ALL_FORMATS, UrlSource } from 'mediabunny';

export class FrameDecoder {
  private frames: VideoFrame[] = [];
  private ready = false;
  private intrinsicW = 0;
  private intrinsicH = 0;

  get frameCount(): number {
    return this.frames.length;
  }

  get isReady(): boolean {
    return this.ready;
  }

  get videoWidth(): number {
    return this.intrinsicW;
  }

  get videoHeight(): number {
    return this.intrinsicH;
  }

  async init(url: string): Promise<void> {
    const input = new Input({
      source: new UrlSource(url),
      formats: ALL_FORMATS,
    });

    const videoTrack = await input.getPrimaryVideoTrack();
    if (!videoTrack) throw new Error('No video track found');

    const config = await videoTrack.getDecoderConfig();
    if (!config) throw new Error('No decoder config');

    const collected: VideoFrame[] = [];

    const decoder = new VideoDecoder({
      output: (frame) => {
        collected.push(frame);
      },
      error: (e) => console.error('VideoDecoder error:', e),
    });
    decoder.configure(config);

    const sink = new (await import('mediabunny')).EncodedPacketSink(videoTrack);
    const chunks: EncodedVideoChunk[] = [];
    for await (const packet of sink.packets()) {
      chunks.push(packet.toEncodedVideoChunk());
    }

    for (const chunk of chunks) {
      decoder.decode(chunk);
    }
    await decoder.flush();
    decoder.close();

    collected.sort((a, b) => a.timestamp - b.timestamp);
    this.frames = collected;
    this.ready = true;

    if (this.frames.length > 0) {
      this.intrinsicW = this.frames[0].codedWidth;
      this.intrinsicH = this.frames[0].codedHeight;
    }

    console.log(`[FrameDecoder] Decoded ${this.frames.length} frames — ${this.intrinsicW}x${this.intrinsicH}`);
  }

  /**
   * Draw a frame into the destination ctx, maintaining the video's intrinsic
   * aspect ratio.  The frame is "contained" inside (dstW, dstH) — centred
   * with the remaining space filled transparently.
   */
  drawFrame(
    ctx: CanvasRenderingContext2D,
    dstW: number,
    dstH: number,
    fraction: number,
    isRtl = true,
  ) {
    if (this.frames.length === 0) return;

    const idx = Math.round(fraction * (this.frames.length - 1));
    const frame = this.frames[idx];

    const srcAspect = this.intrinsicW / this.intrinsicH;
    const dstAspect = dstW / dstH;

    let drawW: number;
    let drawH: number;
    let offsetX: number;
    let offsetY: number;

    if (srcAspect > dstAspect) {
      drawW = dstW;
      drawH = dstW / srcAspect;
      offsetX = 0;
      offsetY = (dstH - drawH) / 2;
    } else {
      drawH = dstH;
      drawW = dstH * srcAspect;
      offsetX = isRtl ? 0 : dstW - drawW;
      offsetY = 0;
    }

    ctx.clearRect(0, 0, dstW, dstH);
    ctx.drawImage(frame, offsetX, offsetY, drawW, drawH);
  }

  destroy() {
    for (const frame of this.frames) {
      frame.close();
    }
    this.frames = [];
    this.ready = false;
  }
}
