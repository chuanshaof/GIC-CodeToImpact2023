import { useState, useEffect } from 'react';
// @mui
import { Box, Container, Typography, Stack, Button, InputLabel, FormControl, MenuItem } from '@mui/material';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import Select, { SelectChangeEvent } from '@mui/material/Select';



import axios from 'axios'
// hooks
import useSettings from '../../../../hooks/useSettings';
// sections
import {
    AnalyticsTasks,
    AnalyticsNewsUpdate,
    AnalyticsOrderTimeline,
    AnalyticsCurrentVisits,
    AnalyticsWebsiteVisits,
    AnalyticsTrafficBySite,
    AnalyticsWidgetSummary,
    AnalyticsCurrentSubject,
    AnalyticsConversionRates,
} from '.';


// ----------------------------------------------------------------------

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const fundIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export default function Query23() {
    const { themeStretch } = useSettings();
    const [data, setData] = useState(null);
    const [fundId, setFundId] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const handleFundChange = (e) => {
        setFundId(e.target.value)
    }

    const handleQuery = async () => {
        const query = {
            "fund_id": fundId,
            "startDate": startDate.toISOString().split("T")[0],
            "endDate" : endDate.toISOString().split("T")[0],
        }
        await axios.post(`${process?.env.REACT_APP_BACKEND_URL}/analytics/breakdown`, query).then(
            res => {
                console.log(res.data)}

        )
        
    }


    // useEffect(() => {
    //   axios.get("http://ec2-54-169-209-187.ap-southeast-1.compute.amazonaws.com/routers").then(res => {
    //     setData(res.data.Hello)
    //   });
    // });

    return (
        <Box>
            <Box sx={{ minWidth: 120 }}>
                <Stack direction="row" justifyContent={"space-between"} spacing={2} sx={{ p: 4 }}>
                    <FormControl fullWidth>
                        <InputLabel>Fund ID</InputLabel>
                        <Select
                            value={fundId}
                            label="Type of Filter"
                            onChange={handleFundChange}
                            MenuProps={MenuProps}
                        >
                            {fundIds.map((e) => <MenuItem value={e}> {e} </MenuItem>)}
                        </Select>
                    </FormControl>

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker label="Start Date"
                            value={startDate}
                            onChange={setStartDate} />
                        <DatePicker label="End Date"
                            value={endDate}
                            onChange={setEndDate} />
                    </LocalizationProvider>

                    <Button onClick={handleQuery}> Visualise </Button>
                </Stack>
            </Box>
            <Container maxWidth={themeStretch ? false : 'xl'}>
                <Stack spacing={2}>
                {  data && <AnalyticsWebsiteVisits /> }
                { data && <AnalyticsWebsiteVisits /> }
                </Stack>
            </Container>
        </Box>
    );
}
