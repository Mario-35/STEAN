export class TimeCapture {
    static start: number;
    static last: number;
    static now: number;
    
    constructor() { 
        TimeCapture.start = new Date().getTime();
        TimeCapture.last = TimeCapture.start;
        TimeCapture.now = TimeCapture.start;
    }
    start() {
        TimeCapture.start = new Date().getTime();
    }

    check(message: string) {
        const now = (new Date().getTime());
        console.log(message, 'START:', now - TimeCapture.start, 'LAST:', now - TimeCapture.last);
        TimeCapture.last = now;
    }
}
