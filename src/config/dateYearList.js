import React from "react";

export default function dateYearList() {
    const minOffset = 0;
    const maxOffset = 1;
    const thisYear = (new Date()).getFullYear();

    const options = [];
    
    for (let i = minOffset; i <= maxOffset; i++) {
      const year = thisYear - i;
      options.push(<option value={year}>{year}</option>);
    }

    return (options);
}