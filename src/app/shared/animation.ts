import { style, state, animate, transition, trigger } from '@angular/core';
export const slideIn =
    trigger('slideIn', [
        state('*', style({ 'overflow-y': 'hidden', 'overflow-x': 'hidden' })),
        state('void', style({ 'overflow-y': 'hidden', 'overflow-x': 'hidden' })),
        transition('* => void', [
            style({ height: '*' }),
            animate(250, style({ height: 0 }))
        ]),
        transition('void => *', [
            style({ height: '0' }),
            animate(250, style({ height: '*' }))
        ])
    ]);

