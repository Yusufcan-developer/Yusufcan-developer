
export const getIsPointAddressDelivery = () => {
    const isPointAddressDelivery = localStorage.getItem('isPointAddressDelivery');
    if (isPointAddressDelivery === 'true') { return true }

    return false;
};