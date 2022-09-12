import React, { useCallback, useState, useEffect } from "react";

import ShiftData from './Data/ShiftData.json';


// 休み希望は確定
// その日のリーダー1名以上 -> 権限設定が必要
//  職員情報の管理・職能（日報・ジャケット・パンツ）・浮動
// 毎週月曜のMTで，１人決まった参加者・月イチでは別の（基本のサブメンバ）．
// 勤務形態（週３，４，５）
// 土日休みの均等化（月２〜３を目安）/要求に合わせる
// ４連勤は最大月１(連勤希望)

// rankには，manager, r_member, parttime_memberのどれか
// abilityは１０個くらい（今後も増える可能性）

const ShiftCalculator = (ShiftData) => {

    /************ データの取得部分 ***************/
    // 外部からメンバーデータを取得して変数に格納
    const member = ShiftData.member_data;
    // 外部からシフト希望データを取得して変数に格納
    // 日付の直接指定・曜日指定・どこでもいいから月のうちX日指定・土曜日か日曜日かというパターンを予め利用可能な形式に変換しておく
    const requests = ShiftData.shift_request;
    // 外部からカレンダーデータを所得して変数に格納
    const calendar = ShiftData.calendar_data;

    /************ 補助的な関数の部分 ************/
    const generateRandomSelectNumber = (target_data_length) => {
	// 特定の数（targetDataLength-1）を最大値として０以上のランダムな数値を出力する関数
	// ランダムなメンバー選択関数実装のための補助的関数
	return Math.floor( Math.random() * target_data_length );
    }

    const generateRandomNumber = (min_number, max_number) => {
	// 特定の数（最小値）〜特定の数（最大値）のあいだの数を生成
	return min_number + Math.floor( Math.random() * ((max_number + 1) - min_number));
    }

    const getElements = (target_data, require_minimam_number, require_max_number) => {
	// targetDataに指定したJSONデータの中から，必要な要素数分だけランダムに重複なく選択
	// 指定した最小数と最大数の間で抽出
	// 選択するランダムな要素数を（指定範囲内で）ランダムに決定
	const selection_number = generateRandomNumber(require_minimam_number, require_max_number);
	const selection_data = []; // 乱択した要素データを格納する配列
	const selected_numbers = []; // 乱択済みの要素指定Indexを格納する配列．既に選択されているかの簡単判定用
	
	for(let i = 0; i < selection_number; i++) {
	    // 必要な要素数分だけ重複なく選択できるまで繰り返し		
	    // 検索対象データの中の指定する番号をランダム生成
	    while(true) {
		const random_number = generateRandomSelectNumber(target_data.length);
		if(!selected_numbers.includes(random_number)) {
		    // まだ選択されていないIndexの場合
		    selection_data.push(target_data[random_number]); // 選択データを格納
		    selected_numbers.push(random_number); // 選択済みのIndexを格納
		    break;
		}
	    }
	}

	return selection_data;
    }

    const checkDuplication = (target_data) => {
    }

    /************ 職員データ・シフト希望データ・カレンダーデータの取得に関わる関数部分 ***********/
    const findMemberInfo = (member_id) => {
	// 特定のメンバーIDを持つメンバーのデータを取得
	return member.find(m => {
	    return m.member_id === member_id;
	});
    }

    const findMemberRestRequest = (member_id) => {
	// 特定職員（職員ID）のシフト希望データを取得
	return requests.find(m => {
	    return m.member_id === member_id;
	}).request;
    }


    const findRandomMemberFromAbility = (target_ability) => {
	// 特定の職能を持つ人達の中から１名をランダムで選択
	const candidates = member.filter(m => {
	    return m.ability[target_ability] === 'ok';
	});
	const random_select_number = generateRandomSelectNumber(candidates.length);
	return candidates[random_select_number];
    }

    const dayAvailability = (member_id, check_target_day) => {
	// 全員のシフト希望データの中からある人がある日に働けるかどうか？を計算する関数
	const member_request = findMemberRestRequest(member_id); // ある人のシフト希望を抽出
	const member_day_availability = member_request.find(d => { // シフト希望の中から特定日の希望を抽出
	    return d.date === check_target_day;
	}).ok_ng;
	return member_day_availability === 'ok';
    }

    const shiftAvailableMembers = (date) => {
	// ある日に働ける職員のID一覧を取得
	const day_available_members = member.filter(m => {
	    return dayAvailability(m.member_id, date);
	}).map(m => m.member_id);
	return { date: date, working_member_ids: day_available_members };
    }

    const shiftAvailableMembersFilteredByRank = (date, rank) => {
	// ある職階の人で，その日に働ける人一覧を取得
	// shiftAvailableMembersFilteredByRank('20220901', 'manager')とか使う
	const members = shiftAvailableMembers(date);
	return shiftAvailableMembers(date).working_member_ids.filter(m => {
	    return findMemberInfo(m).rank === rank;
	});
    }

    const shiftAvailableMembersFilteredByAbility = (date, ability) => {
	// ある職能を持っている人たちで，その日に働ける人一覧を取得
	// shiftAvailableMembersFilteredByAbility('20220901', 'jacket')とか使う)
	return shiftAvailableMembers(date).working_member_ids.filter(m => {
	    return findMemberInfo(m).ability[ability] === 'ok';
	});
    }

    

    /************ 満たすべきシフトルール（関数）の一覧データ（照会用） **************/
    /******************** 仮生成時にチェックしないとエグい計算量（ランダム生成をめっちゃせなあかん）そうなもの 
     ******************** 生成時にランダムではなく意図的に選択する ******************/
    const dailyManagerSelect = (date) => {
	// その日には必ずマネージャー役の人がいないといけない
	//shiftAvailableMembersFilteredByRank(date, 'manager')って使う
	return getElements(shiftAvailableMembersFilteredByRank(date, 'manager'), 1, 1)[0];
    }

    const dailyLeaderSelect = (date) => {
	// その日には必ずリーダー役の人が１人以上いないといけない
	return getElements(shiftAvailableMembersFilteredByAbility(date, 'leader'), 1, 1)[0];
    }

    
    /******************** 仮生成後チェックで十分な計算量になりそうなもの ******************/
    const jacketMemberCheck = (date, ability) => {

    }


    /**************** 仮シフト候補の演算 ***************/
    const shiftCandidate = () => {
	// 適当にシフトを生成して，すべてのルールに当てはまっているものができるまでループする処理
	// チェック対象のランダム生成シフト
	let shift_candidate_candidate;
	
	// 沢山生成しようとして失敗スル可能性はある（すべての条件を満たすシフトが条件的に組めない場合）
	// 一定時間（試行回数）で失敗するようにしておく
	// 諦めたルールはエラーとして出力
	const violate_rules = [];
	const assertViolate = (violated_rule) => {
	    violate_rules.push(violated_rule);
	}

	const limit_of_trials = 10; // 試行回数の上限

	// 試行開始
	for(let shift_generation_count = 0; shift_generation_count <= limit_of_trials; shift_generation_count++) {		
	    shift_candidate_candidate = calendar.map(date => {
		/******** マネージャーの選択 **************/
		const manager = dailyManagerSelect(date.date); 		
		
		/******** リーダーの選択 **************/
		let leader = dailyLeaderSelect(date.date); // リーダーの選択
		for(let leader_gen_count = 0; leader_gen_count <= limit_of_trials; leader_gen_count++) {
		    if(leader === manager) {
			leader = dailyLeaderSelect(date.date); // マネージャーとは別人になるまで選択

			if(leader_gen_count === limit_of_trials) assertViolate('cannot select leader')
		    } else {
			break;
		    }
		}

		
		/******** その他の職員の選択 **************/
		const other_members_candidate_candidate = shiftAvailableMembers(date.date).working_member_ids.filter(m => {
		    // マネージャー候補とリーダー候補以外の出勤可能メンバー一覧を取得
		    return m !== manager && m !== leader;
		});
		const other_members = [];

		const other_members_require_min_number = date.require_min_member_number - 2;
		const other_members_require_max_number = date.require_max_member_number - 2;
		if(other_members_require_min_number >= 0 && other_members_require_min_number >= 1) {
		    // マネージャーとリーダーの２人を抜いて，必要人員がまだ必要な場合
		    const members = getElements(other_members_candidate_candidate,
						other_members_require_min_number,
						other_members_require_max_number);
		    other_members.push(...members);
		}

		return {
		    date: date.date,
		    yobi: date.yobi,
		    working_candidate_member_ids: [
			manager, leader, ...other_members,
		    ]
		}
		
	    });

	    
	    // 各ルールを満たすシフトになっているか演算
	    const shift_rules_satisfactions = {
		//leader_exist: dailyLeaderRequire(shift_candidate_candidate),
		
	    }

	    // 全ルールを満たしていればそのシフト案を出力
	    // if(Object.keys(shift_rules_satisfactions).map(key => {
	    // 	return shift_rules_satisfactions.key
	    // }).filter(d => d===false).length === 0) {
	    // 	return shift_candidate_candidate;
	    // }
	    //}
	}

	return { shiftCandidate: shift_candidate_candidate, violations: violate_rules };
    }

    return shiftCandidate();
}

export default ShiftCalculator;
