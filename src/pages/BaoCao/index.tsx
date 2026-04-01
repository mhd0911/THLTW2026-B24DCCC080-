import { Card,Row,Col,Statistic } from 'antd'
import Chart from './components/Chart'

export default ()=>{

 return(

  <>
   <Row gutter={16}>

    <Col span={6}>
     <Statistic title="Số CLB" value={5}/>
    </Col>

    <Col span={6}>
     <Statistic title="Pending" value={10}/>
    </Col>

    <Col span={6}>
     <Statistic title="Approved" value={20}/>
    </Col>

    <Col span={6}>
     <Statistic title="Rejected" value={5}/>
    </Col>

   </Row>

   <Card style={{marginTop:20}}>
      <Chart/>
   </Card>

  </>
 )

}