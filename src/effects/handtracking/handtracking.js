class handtracking_effect extends effect {
    constructor(gfx, smoothing) {
        super(gfx);

        this.ls = smoothing || 0.9; // lerp scale for smoothing out input

        gfx.data.hand = {
            x: -100,
            y: -100,
            _last_x: 0,
            _last_y: 0
        };
        gfx.data.finger = {
            x: -100,
            y: -100,
            _last_x: 0,
            _last_y: 0
        };

        this.fingerRange = {
            xmin: -420, xmax: 420,
            ymin: -600, ymax: 10,
        };
        this.fingerRange.x = Math.abs(this.fingerRange.xmin - this.fingerRange.xmax);
        this.fingerRange.y = Math.abs(this.fingerRange.ymin - this.fingerRange.ymax);

        this.handRange = {
            xmin: -200, xmax: 200,
            ymin: -300, ymax: -90,
        };
        this.handRange.x = Math.abs(this.handRange.xmin - this.handRange.xmax);
        this.handRange.y = Math.abs(this.handRange.ymin - this.handRange.ymax);

        gfx.conf.gui.add(gfx.data.hand, 'x').name('Hand x').listen();
        gfx.conf.gui.add(gfx.data.hand, 'y').name('Hand y').listen();
        gfx.conf.gui.add(gfx.data.finger, 'x').name('Finger x').listen();
        gfx.conf.gui.add(gfx.data.finger, 'y').name('Finger y').listen();
        this.author = document.getElementById('author');
    }
    update(gfx) {
        if (gfx.data.leapFrame) {
            let hand = gfx.data.leapFrame.hands[0];
            if (hand) {
                if (hand.indexFinger.valid) {
                    let finger = hand.indexFinger.stabilizedTipPosition;
                    let x = finger[0];
                    let y = finger[1] * -1; // flip y
                    x -= this.fingerRange.xmin; // shift x into +x quadrants
                    y -= this.fingerRange.ymin; // shift y into +y quadrants
                    x /= this.fingerRange.x; // scale x down to 0..1
                    y /= this.fingerRange.y; // scale y down to 0..1
                    gfx.data.finger.x = (1 - this.ls) * gfx.data.hand._last_x + this.ls * x;
                    gfx.data.finger.y = (1 - this.ls) * gfx.data.hand._last_y + this.ls * y;
                    gfx.data.finger.vx = x - gfx.data.finger._last_x;
                    gfx.data.finger.vy = y - gfx.data.finger._last_y;
                    gfx.data.finger._last_x = gfx.data.finger.x;
                    gfx.data.finger._last_y = gfx.data.finger.y;
                }

                let palm = hand.stabilizedPalmPosition;
                let x = palm[0];
                let y = palm[1] * -1;
                x -= this.handRange.xmin; // shift x into +x quadrants
                y -= this.handRange.ymin; // shift y into +y quadrants
                x /= this.handRange.x; // scale x down to 0..1
                y /= this.handRange.y; // scale y down to 0..1
                gfx.data.hand.x = (1 - this.ls) * gfx.data.hand._last_x + this.ls * x;
                gfx.data.hand.y = (1 - this.ls) * gfx.data.hand._last_y + this.ls * y;
                gfx.data.hand.vx = x - gfx.data.hand._last_x;
                gfx.data.hand.vy = y - gfx.data.hand._last_y;
                gfx.data.hand._last_x = x;
                gfx.data.hand._last_y = y;

                this.rescale(gfx);
            }
        }
    }
    rescale(gfx) {
    }
    destroy(gfx) {
    }
}
