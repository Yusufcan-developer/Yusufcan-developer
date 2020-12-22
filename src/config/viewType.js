
export default function viewType(formName) {
    let newView = 'MobileView';

    if(formName === 'Filter'){
        if (window.innerWidth > 766) {
            newView = 'DesktopView';
        }
    }
    if (formName === 'Reports') {
        if (window.innerWidth > 1220) {
            newView = 'DesktopView';
        }
    }
    else if(formName==='CartTable'){
        if (window.innerWidth > 766) {
            newView = 'DesktopView';
          }
    }
    else if(formName==='ProductDetail'){
        if (window.innerWidth > 769) {
            newView = 'DesktopView';
          } else if (window.innerHeight > 767) { newView = 'TabletView' }
    }
    else if (formName === 'Users') {
        if (window.innerWidth > 1220) {
            newView = 'DesktopView';
        }
    }
    else if (formName === 'CartList') {
        if (window.innerWidth > 1220) {
            newView = 'DesktopView';
        }
    }
    else if (formName === 'Notifications') {
        if (window.innerWidth > 1220) {
            newView = 'DesktopView';
        }
    }
    else if (formName === 'Logs') {
        if (window.innerWidth > 1220) {
            newView = 'DesktopView';
        }
    }
    else if (formName === 'Categories') {
        if (window.innerWidth > 1220) {
            newView = 'DesktopView';
        }
    }
    return newView;
};
