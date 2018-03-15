import LocalizedStrings from 'react-native-localization';

let strings = new LocalizedStrings({
  "en": {
    "new_week_notice":	"It's a new week",
    "new_week_greeting":	"Have a great week!",
    "import_desc": "Import To-Do items from last week",
    "start":	"Start",
    "press_select":	"PRESS TO SELECT",
    "week":	"Week",
    "create_desc":	"Create To-Do Item",
    "title":	"Title",
    "note":	"Note",
    "next":	"Next",
    "cancel":	"cancel",
    "duplicate_desc":	"Choose cells where you want to copy to",
    "done":	"Done",
    "edit_desc":	"ModifyTo-Do Item",
    "import":	"Import",
    "from_prev":	"from previous week",
    "nothing": "Nothing to import in previous week",
    "reset":	"Reset",
    "current_week": "current week",
    "import_confirm_desc":	"It will import your to-do items from the last week {0}. Current Week : {1}.",
    "confirm":	"Confirm",
    "reset_confirm_desc":	"All the to-do items of the current week {0} will be removed.",
    "contact_dev":	"Contact Developer",
    "rate_app":	"Rate App",
    "like_on_fb": "Like on Facebook",
    "date_format": "D MMM YYYY",
    "date_format_short": "D MMM \'YY"
  },
  "ko": {
    "new_week_notice" :	"새로운 한주 입니다",
    "new_week_greeting" :	"기분좋은 일주일 보내세요",
    "import_desc": "지난주의 할일 가져오기",
    "start" :	"시작",
    "press_select" :	"눌러서 선택",
    "week" :	"주",
    "create_desc" :	"새 할일 만들기",
    "title" :	"제목",
    "note" :	"메모",
    "next" :	"다음",
    "cancel" :	"취소",
    "duplicate_desc" :	"붙여넣을 셀을 선택하세요(복수 선택 가능)",
    "done" :	"완료",
    "edit_desc" :	"할일 수정",
    "import" :	"가져오기",
    "from_prev" :	"이전주로부터",
    "nothing": "가져올 항목이 없습니다",
    "reset" :	"재설정",
    "current_week": "현재의 주를",
    "import_confirm_desc" :	`이전 주 {0} 로 부터 할일을 가져옵니다. 현재주 : {1}`,
    "confirm" :	"확인",
    "reset_confirm_desc" :	"현재주의 모든 할일 항목이 지워집니다",
    "contact_dev" :	"개발자에게 문의하기",
    "rate_app" :	"앱 평가하기",
    "like_on_fb": "페북에 좋아요하기",
    "date_format": "YYYY.M.D", //     2018.12.14
    "date_format_short": "YY\' M.D"// 18' 12.13
  }
});

module.exports = strings