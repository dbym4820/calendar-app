// 日付とその日毎に変動するパラメータ（例．その日必要な人員の数）を格納したカレンダーデータ

const CalendarData = [
    {
	date: '2022-09-01',
	yobi: 'Thursday',
	require_min_member_number: '3',
	require_max_member_number: '4',	
    },
    {
	date: '2022-09-02',
	yobi: 'Friday',
	require_min_member_number: '3',
	require_max_member_number: '3',
    },
    {
	date: '2022-09-03',
	yobi: 'Saturday',
	require_min_member_number: '3',
	require_max_member_number: '5',
    }
];


export default CalendarData;
