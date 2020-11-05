import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
    name: 'romanconvert',
})
export class RomanConvertPipe implements PipeTransform {
    list: { [key: string]: number } = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 }
    roman = ''

    transform(value: any): any {
        this.roman = ''
        let temp = value
        for (const i in this.list) {
            if (this.list[i]) {
                while (temp >= this.list[i]) {
                    this.roman += i
                    temp -= this.list[i]
                }
            }
        }
        return this.roman
    }
}
