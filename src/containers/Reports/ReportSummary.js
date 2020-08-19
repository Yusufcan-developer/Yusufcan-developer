//React
import React, { useState, useEffect } from "react";


//Other Library
import { Table, Typography } from 'antd';
import numberFormat from "@iso/config/numberFormat";
import _ from 'underscore';
const { Text } = Typography;

export default (columns, data, hasExpandColumn = false) => {

    function calculateSummary(footerKey) {
        const total = _.reduce(data, (memo, item) => {
            return memo + item[footerKey];
        }, 0);
        return numberFormat(total)
    }
    //Render işlemi
    return (
        <>
            <Table.Summary.Row align= "right">
                {hasExpandColumn ? <Table.Summary.Cell></Table.Summary.Cell> : null}
                {
                    _.map(columns, col => (
                        <Table.Summary.Cell >
                        <Text type="danger"> {col.footerKey ? calculateSummary(col.footerKey) : null}</Text>                           
                        </Table.Summary.Cell>
                    ))
                }
            </Table.Summary.Row>
        </>
    );
}
