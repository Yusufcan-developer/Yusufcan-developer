
export default function ResultNumberFormat(value) {
    var formattingNumber = new Number(value);
    var myObj = {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }
    
    return (formattingNumber.toLocaleString("tr-TR", myObj));
    }