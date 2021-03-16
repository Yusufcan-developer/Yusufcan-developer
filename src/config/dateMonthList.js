import React from "react";

export default function dateMonthList() {
    const months = [1,2,3,4,5,6,7,8,9,10,11,12];
    const monthsText = ['O1 Ocak', '02 Şubat', '03 Mart', '04 Nisan', '05 Mayıs', '06 Haziran', '07 Temmuz', '08 Ağusto', '09 Eylül', '10 Ekim', '11 Kasım', '12 Aralık'];
    const options = [];
    for (let i = 0; i < months.length; i++) {
        const month = months[i];
        options.push(<option value={month}>{monthsText[i]}</option>);
      }
    return (options);
}