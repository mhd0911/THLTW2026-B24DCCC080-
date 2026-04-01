import { Table,Button,Modal,Select } from 'antd'
import { useState } from 'react'

const ThanhVienTable = ()=>{

 const [data,setData] = useState<any[]>([])
 const [selected,setSelected] = useState<any[]>([])
 const [open,setOpen] = useState(false)

 const rowSelection={
   onChange:(keys:any,rows:any)=>setSelected(rows)
 }

 const columns:any=[
  {title:"Họ tên",dataIndex:"name"},
  {title:"Email",dataIndex:"email"},
  {title:"SĐT",dataIndex:"phone"},
  {title:"CLB",dataIndex:"club"}
 ]

 return(

  <>
    <Button onClick={()=>setOpen(true)}>
      Chuyển CLB ({selected.length})
    </Button>

    <Table
      rowSelection={rowSelection}
      columns={columns}
      dataSource={data}
      rowKey="id"
    />

    <Modal open={open} title="Chuyển CLB">

      <Select style={{width:"100%"}}>
        <Select.Option value="1">CLB Bóng đá</Select.Option>
        <Select.Option value="2">CLB IT</Select.Option>
      </Select>

    </Modal>

  </>
 )

}

export default ThanhVienTable