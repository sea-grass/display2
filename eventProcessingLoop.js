var Rx = require('rxjs/Rx');

function start (fps, init, update, render) {
    'use strict';
    const time$ = Rx.Observable.interval(1000 / fps);
    const queue = Rx.Scheduler.queue;
    const boardStateSubject = new Rx.Subject();
    const animationFrameScheduler = Rx.Scheduler.animationFrame;

    queue.schedule(init, 0, {
        time: 0
    });

    time$
        .subscribe(
        t => {
            const state = {
                time: t
            };
            queue.schedule((state) => { update(state, boardStateSubject); }, 0, state);
        }
        );
    boardStateSubject
        .subscribe(
            state => animationFrameScheduler.schedule(state => {
                render(state);
            }, 0, state)
        )
}


module.exports = start;