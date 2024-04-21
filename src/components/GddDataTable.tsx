import {DataTable} from 'react-native-paper';
import {DailyGddAcc} from './gddplot/Plot';
import {format} from 'date-fns';

export default function GddDataTable(props: {gddArray: DailyGddAcc[]}) {
  return (
    <DataTable>
      <DataTable.Header>
        <DataTable.Title>Day</DataTable.Title>
        <DataTable.Title>GDD</DataTable.Title>
        <DataTable.Title>GDD - Total</DataTable.Title>
        <DataTable.Title>GDD Type</DataTable.Title>
      </DataTable.Header>
      {props.gddArray.map(i => (
        <DataTable.Row key={i.dateUnixMs}>
          <DataTable.Cell>
            {format(new Date(i.dateUnixMs), 'EEEEEE dd/MM')}
          </DataTable.Cell>
          <DataTable.Cell>{i.gdd.toFixed(1)}</DataTable.Cell>
          <DataTable.Cell>{i.gddAcc.toFixed(1)}</DataTable.Cell>
          <DataTable.Cell>{i.weatherType}</DataTable.Cell>
        </DataTable.Row>
      ))}
    </DataTable>
  );
}
