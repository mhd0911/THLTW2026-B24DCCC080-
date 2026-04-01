import { Column } from '@ant-design/charts'

const Chart = ()=>{

 const data = [

  {club:'Bóng đá',type:'Approved',value:20},
  {club:'Bóng đá',type:'Rejected',value:5},

  {club:'IT',type:'Approved',value:15},
  {club:'IT',type:'Pending',value:10},

 ]

 const config:any = {

   data,
   xField:'club',
   yField:'value',
   seriesField:'type',
   isGroup:true

 }

 return <Column {...config}/>
}

export default Chart