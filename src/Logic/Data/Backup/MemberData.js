// 組織に所属する職員の基本データ

const MemberData = [
    {
	member_id: '0000000',
	first_name: '知岐',
	last_name: '油谷',
	rank: 'r_member',
	ability: {
	    leader: 'ok',
	    daily_report: 'ok',
	    conduct: 'ok',
	    machine: 'ok',
	    jacket: 'ok',
	    
	}
    },
    {
	member_id: '0000001',
	first_name: '夏実',
	last_name: '森',
	rank: 'manager',
	ability: {
	    leader: 'ok',
	    daily_report: 'ok',
	    conduct: 'ok',
	    machine: 'ng',
	    jacket: 'ok',
	    
	}
    },
    {
	member_id: '0000002',
	first_name: '太郎',
	last_name: '田中',
	rank: 'parttime_member',
	ability: {
	    leader: 'ng',
	    daily_report: 'ok',
	    conduct: 'ok',
	    machine: 'ok',
	    jacket: 'ng',
	}
    },
    {
	member_id: '0000003',
	first_name: '一郎',
	last_name: '山田',
	rank: 'parttime_member',
	ability: {
	    leader: 'ok',
	    daily_report: 'ok',
	    conduct: 'ok',
	    machine: 'ok',
	    jacket: 'ng',
	}
    },
    {
	member_id: '0000004',
	first_name: '浩二',
	last_name: '佐藤',
	rank: 'r_member',
	ability: {
	    leader: 'ng',
	    daily_report: 'ok',
	    conduct: 'ok',
	    machine: 'ok',
	    jacket: 'ng',
	}
    },
    {
	member_id: '0000005',
	first_name: '次郎',
	last_name: '鈴木',
	rank: 'manager',
	ability: {
	    leader: 'ok',
	    daily_report: 'ok',
	    conduct: 'ok',
	    machine: 'ok',
	    jacket: 'ok',
	}
    },
    {
	member_id: '0000006',
	first_name: '大輔',
	last_name: '高橋',
	rank: 'parttime_member',
	ability: {
	    leader: 'ng',
	    daily_report: 'ok',
	    conduct: 'ok',
	    machine: 'ok',
	    jacket: 'ng',
	}
    }];

export default MemberData;
