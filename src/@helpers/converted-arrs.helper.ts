// функция пробегается по массиву объектов и добавляет в результирующий массив все value указанного key
export function getArrValueByKeyInArrObjects(arr: any[], keyName: string) {
    let res = []
    arr.forEach((element: any)  => {
        Object.entries(element).forEach((el: any) => {
         if (el[0] === keyName) {res.push(el[1])}
        })
    });
    return res
}

export function checkUniquenessTwoArrays(arr1: any[], arr2: any[]) {
    let unique = arr1.filter((el) => arr2.indexOf(el) === -1)
    return unique
}