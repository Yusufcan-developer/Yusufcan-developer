//React
import React, { useState, useEffect } from "react";


//Other Library
import { Table, Typography } from 'antd';
import numberFormat from "@iso/config/numberFormat";
import _ from 'underscore';
const { Text } = Typography;

export default (columns, data, hasExpandColumn = false, aggregatesData, generalTotal) => {

    function calculateSummary(footerKey) {        
        if (footerKey === 'Genel Toplam') { return 'Toplam' } else {
            const total = _.reduce(data, (memo, item) => {
                return memo + item[footerKey];
            }, 0);
            return numberFormat(total)
        }
    }
    
    function calculateAggregatesSummary(footerKey) {
        let total = 0;
        if (footerKey === 'Genel Toplam') { return 'Genel Toplam' } else {
            _.each(aggregatesData, (item) => {
                if (item.field === footerKey) {
                    total = item.value;
                }
            })

        } return numberFormat(total);
    }
    //Render işlemi
    return (
        <>
            <Table.Summary.Row align="right">
                {hasExpandColumn ?  <Table.Summary.Cell></Table.Summary.Cell>: null}
                {
                    _.map(columns, col => (
                        <Table.Summary.Cell >
                            <Text textStyleBold style={{fontWeight:"bold"}} type="danger"> {col.footerKey ? calculateSummary(col.footerKey) : null}</Text>
                        </Table.Summary.Cell>
                    ))
                }                
            </Table.Summary.Row>

            
            {generalTotal ? 
            <Table.Summary.Row align="right">
                {hasExpandColumn ? <Table.Summary.Cell></Table.Summary.Cell> : null}
                {
                    _.map(columns, col => (
                        <Table.Summary.Cell >
                            <Text type="danger" style={{fontWeight:"bold"}}> {col.footerKey ? calculateAggregatesSummary(col.footerKey) : null}</Text>
                        </Table.Summary.Cell>
                    ))
                }                
            </Table.Summary.Row>
           :null}
        </>
    );
}
