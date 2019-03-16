import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'addDays' })
export class AddDays implements PipeTransform {
    transform(date: Date, days: number): Date {
        date.setDate(date.getDate() + parseInt(days.toString()));
        return date;
    }
}
