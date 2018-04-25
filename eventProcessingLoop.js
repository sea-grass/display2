var Rx = require('rxjs/Rx');

const fps = 10;

function start (init, update, render) {
    'use strict';
    const timeObservable = Rx.Observable.interval(1000 / fps);
    const queue = Rx.Scheduler.queue;
    const boardStateSubject = new Rx.Subject();

    queue.schedule(init, 0, {
        time: 0
    });

    timeObservable
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
            state => {
                render(state);
            }
        )
}


module.exports = start;