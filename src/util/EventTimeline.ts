import { IAnimationTween } from "./AnimationEvent";

export class EventTimeline implements IAnimationTween {
  private _events: IAnimationTween[] = [];
  register(event: IAnimationTween) {
    this._events.push(event)
  }

  /**
   * Makes the timeline progress with a given value that is between 0 and 1.
   * @param progressValue Value between 0 and 1.
   */
  progress(progressValue: number) {
    const totalProgress = progressValue * this._events.length;

    this._events.forEach((event, index) => {
      const vn = totalProgress - index;

      if (vn >= 0 && vn < 1) {
        event.progress(vn);
      } else {
        event.progress(0);
      }
    });
  }
}
