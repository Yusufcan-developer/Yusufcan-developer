
export default function NumberFormat(value) {
var formattingNumber = new Number(value);
var myObj = {
  style: "decimal",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}

return (formattingNumber.toLocaleString("tr-TR", myObj));
}