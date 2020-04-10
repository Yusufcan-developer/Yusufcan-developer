import React, {  useState, useEffect } from "react";
import { Table, Row, Col, Pagination, Dropdown, Menu, Badge } from "antd";
import { DownOutlined , PoweroffOutlined } from '@ant-design/icons';
import { useGetApi } from "@iso/lib/hooks/fetchData/useFakeGetApi";

const NestedTable = () => {
    // const[data, loading , setOnChange] = useGetApi(`http://localhost:3000/orders`);
  
    // const columns = [
    //   {
    //     title: "Bayi",
    //     dataIndex: "orderNo",
    //     key: "orderNo",
    //     ellipsis: true
    //   },
    //   {
    //     title: "Bayi",
    //     dataIndex: "orderDate",
    //     key: "orderDate",
    //     ellipsis: true
    //   },
    //   {
    //     title: "Bayi",
    //     dataIndex: "type",
    //     key: "type",
    //     ellipsis: true
    //   },
    //   {
    //     title: "Bayi",
    //     dataIndex: "itemCode",
    //     key: "itemCode",
    //     ellipsis: true
    //   },
    //   {
    //     title: "Bayi",
    //     dataIndex: "itemCode",
    //     key: "itemCode",
    //     ellipsis: true
    //   },
    //   {
    //     title: "Bayi",
    //     dataIndex: "itemDescription",
    //     key: "itemDescription",
    //     ellipsis: true
    //   },
    //   {
    //     title: "Bayi",
    //     dataIndex: "description",
    //     key: "description",
    //     ellipsis: true
    //   },
    //   {
    //     title: "Bayi",
    //     dataIndex: "unit",
    //     key: "unit",
    //     ellipsis: true
    //   },
    //   {
    //     title: "Bayi",
    //     dataIndex: "amount",
    //     key: "amount",
    //     ellipsis: true
    //   },
    //   {
    //     title: "Bayi",
    //     dataIndex: "remainingAmount",
    //     key: "remainingAmount",
    //     ellipsis: true
    //   },
    //   {
    //     title: "Bayi",
    //     dataIndex: "unitPrice",
    //     key: "unitPrice",
    //     ellipsis: true
    //   },
    //   {
    //     title: "Bayi",
    //     dataIndex: "vat",
    //     key: "vat",
    //     ellipsis: true
    //   },
    //   {
    //     title: "Bayi",
    //     dataIndex: "distributionSuggestedAmount",
    //     key: "distributionSuggestedAmount",
    //     ellipsis: true
    //   },
    //   {
    //     title: "Bayi",
    //     dataIndex: "distributionActualAmount",
    //     key: "distributionActualAmount",
    //     ellipsis: true
    //   },
    //   {
    //     title: "Bayi",
    //     dataIndex: "deliveryAmount",
    //     key: "deliveryAmount",
    //     ellipsis: true
    //   },
  
    // ];
  
  
      const menu = (
      <Menu>
        <Menu.Item>Action 1</Menu.Item>
        <Menu.Item>Action 2</Menu.Item>
      </Menu>
    );
  
  
    const columns = [
      { title: "Date", dataIndex: "date", key: "date" },
      { title: "Name", dataIndex: "name", key: "name" },
  
      { title: "Upgrade Status", dataIndex: "upgradeNum", key: "upgradeNum" },
      {
        title: "Action",
        dataIndex: "operation",
        key: "operation",
        render: () => (
          <span className="table-operation">
            <a>Pause</a>
            <a>Stop</a>
            <Dropdown overlay={menu}>
              <a>
                More <DownOutlined />
              </a>
            </Dropdown>
          </span>
        )
      }
    ];
  
    const data = [];
    for (let i = 0; i < 3; ++i) {
      data.push({
        key: i,
        date: "2014-12-24 23:12:00",
        name: "This is production name",
        upgradeNum: "Upgraded: 56"
      });
    }
  
    return <Table columns={columns} dataSource={data} pagination={false} />;
  }

  export default NestedTable;