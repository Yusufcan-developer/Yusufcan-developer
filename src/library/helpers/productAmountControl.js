import history from '@iso/lib/helpers/history';
import { message } from "antd";
export const productAmountControl = (product, isPartial, selectedQuantity) => {
        if (isPartial) {
            if (product.maxAvailableBox < selectedQuantity) { message.error('Toplam izin verilen sepet miktarına ulaştınız!'); return product.maxAvailableBox }
            { return -1; }
        }
        else {
            if (product.maxAvailablePallet < selectedQuantity) { message.error('Toplam izin verilen sepet miktarına ulaştınız!'); return product.maxAvailablePallet }
            { return -1; }
        }    
};
export const productAmountControlDisabled = (product, isPartial, selectedQuantity) => {
    if (isPartial) {
        if ((product.maxAvailableBox <= selectedQuantity) && (product.maxAvailablePallet <= selectedQuantity))  { return true; }
        { return false; }
    }
    else {
        if (product.maxAvailablePallet <= selectedQuantity) { return true; }
        { return false; }
    }    
};