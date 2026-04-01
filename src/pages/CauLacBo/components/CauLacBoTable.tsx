import { Table, Button, Modal, Form, Input, DatePicker, Switch, Space } from 'antd';
import { useState } from 'react';

const CauLacBoTable = () => {

  const [data,setData] = useState<any[]>([])
  const [open,setOpen] = useState(false)
  const [editing,setEditing] = useState<any>(null)

  const [form] = Form.useForm()

  const submit = (values:any)=>{

    if(editing){
      setData(data.map(i=> i.id===editing.id ? {...i,...values} : i))
    }else{
      setData([...data,{...values,id:Date.now()}])
    }

    setOpen(false)
    setEditing(null)
    form.resetFields()
  }

  const columns:any = [

    {
      title:"Tên CLB",
      dataIndex:"name"
    },

    {
      title:"Ngày thành lập",
      dataIndex:"date"
    },

    {
      title:"Chủ nhiệm",
      dataIndex:"leader"
    },

    {
      title:"Hoạt động",
      render:(r:any)=><Switch checked={r.active}/>
    },

    {
      title:"Thao tác",
      render:(r:any)=>(
        <Space>

          <Button onClick={()=>{
            setEditing(r)
            form.setFieldsValue(r)
            setOpen(true)
          }}>
            Sửa
          </Button>

          <Button danger onClick={()=>{
            setData(data.filter(i=>i.id!==r.id))
          }}>
            Xóa
          </Button>

        </Space>
      )
    }

  ]

  return(
    <>
      <Button type="primary" onClick={()=>setOpen(true)}>
        Thêm CLB
      </Button>

      <Table columns={columns} dataSource={data} rowKey="id"/>

      <Modal open={open} footer={null} onCancel={()=>setOpen(false)}>

        <Form form={form} layout="vertical" onFinish={submit}>

          <Form.Item name="name" label="Tên CLB" rules={[{required:true}]}>
            <Input/>
          </Form.Item>

          <Form.Item name="date" label="Ngày thành lập">
            <DatePicker/>
          </Form.Item>

          <Form.Item name="leader" label="Chủ nhiệm">
            <Input/>
          </Form.Item>

          <Form.Item name="active" label="Hoạt động" valuePropName="checked">
            <Switch/>
          </Form.Item>

          <Button type="primary" htmlType="submit">
            Lưu
          </Button>

        </Form>

      </Modal>
    </>
  )
}

export default CauLacBoTable