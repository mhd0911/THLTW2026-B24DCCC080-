import { Table,Button,Space,Modal,Input,Select } from 'antd'
import { useState } from 'react'

const DonTable = ()=>{

 const [data,setData] = useState<any[]>([])
 const [selected,setSelected] = useState<any[]>([])
 const [rejectOpen,setRejectOpen] = useState(false)

 const rowSelection = {

   onChange:(keys:any,rows:any)=>{
      setSelected(rows)
   }

 }

 const approve = ()=>{
   const ids = selected.map(i=>i.id)

   setData(data.map(i=> ids.includes(i.id)? {...i,status:"Approved"}:i))
 }

 const reject = ()=>{
   setRejectOpen(true)
 }

 const columns:any = [

  {title:"Họ tên",dataIndex:"name"},
  {title:"Email",dataIndex:"email"},
  {title:"SĐT",dataIndex:"phone"},
  {title:"CLB",dataIndex:"club"},
  {title:"Trạng thái",dataIndex:"status"},

  {
   title:"Action",
   render:(r:any)=>(
     <Space>
       <Button>Sửa</Button>
       <Button danger>Xóa</Button>
     </Space>
   )
  }

 ]

 return(

  <>
    <Space>

      <Button type="primary" onClick={approve}>
        Duyệt {selected.length} đơn
      </Button>

      <Button danger onClick={reject}>
        Từ chối {selected.length} đơn
      </Button>

    </Space>

    <Table
      rowSelection={rowSelection}
      columns={columns}
      dataSource={data}
      rowKey="id"
    />

    <Modal
      open={rejectOpen}
      title="Lý do từ chối"
      onCancel={()=>setRejectOpen(false)}
    >
      <Input.TextArea/>
    </Modal>

  </>
 )

}

export default DonTable