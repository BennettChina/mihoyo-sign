const template = `
<table>
  <thead>
    <tr>
      <th scope="col">UID</th>
      <th scope="col">社区</th>
      <th scope="col">签到结果</th>
      <th scope="col">签到米币</th>
      <th scope="col">总米币</th>
      <th scope="col">连续签到</th>
      <th scope="col">备注</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="({uid,name,points, reason, total,signInTimes, isSigned}, idx) in community" :key="idx">
      <th scope="row">{{uid}}</th>
      <th scope="row">{{name}}</th>
      <th scope="row">{{signResult(isSigned)}}</th>
      <th scope="row">{{points}}</th>
      <th scope="row">{{total}}</th>
      <th scope="row">{{signInTimes}}</th>
      <th scope="row">{{reason}}</th>
    </tr>
  </tbody>
</table>
`;

import {computed, defineComponent} from "vue";

export default defineComponent({
    name: 'Community',
    template,
    props: {
        data: Array
    },
    setup(props) {
        const getName = (id) => {
            const map = {
                "1": "崩坏3",
                "2": "原神",
                "3": "崩坏学园2",
                "4": "未定事件簿",
                "5": "大别野",
                "6": "崩坏·星穹铁道",
                "8": "绝区零",
            }
            return map[id];
        }
        const isNumber = (str) => {
            return /^[0-9]+$/.test(str);
        }
        const community = computed(() => {
            const data = [];
            props.data.forEach((item) => {
                const total = item.community.total_points;
                const uid = item.uid;
                const times = item.community.signin_times;
                const isSigned = item.community.is_signed;
                const temp = Object.entries(item.community).map(([k, v]) => {
                    return {
                        uid,
                        name: getName(k),
                        points: isNumber(v) ? v : "0",
                        reason: isNumber(v) ? "" : v,
                        total,
                        signInTimes: times,
                        isSigned
                    }
                })
                data.push(...temp.slice(0, temp.length - 3));
            })
            return data;
        })
        const signResult = (param) => {
            return param === 'true' ? "签到成功" : "签到失败";
        }

        return {
            community,
            signResult
        };
    }
})