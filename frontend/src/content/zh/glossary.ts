/**
 * CommissionMarket 使用的词语及其含义（简体中文）。
 * 键与 `src/content/en/glossary.ts` 相同；npub、nsec、sha256 和 api_sats 保留原名。
 */

import type { GlossaryText } from "../../lib/glossary.ts";

export const glossary: GlossaryText = {
  groups: {
    people: "参与者",
    agreement: "协议",
    schedule: "时间",
    money: "款项",
    identity: "密钥与签名",
    standing: "信誉",
    filing: "工作归入哪里",
  },
  words: {
    client: {
      term: "委托方",
      aka: ["客户", "买方", "甲方", "client"],
      said: "发起委托、设定条款、为交付评级并付款的一方。",
    },
    professional: {
      term: "承接方",
      aka: ["专业人士", "艺术家", "匠人", "乙方", "professional"],
      said: "承接委托、签署要约、完成工作并交付的一方。",
    },
    arbiter: {
      term: "仲裁人",
      aka: ["仲裁", "arbiter"],
      said: "封面页上指定的、双方都信任的人。仲裁人签署要约，裁决申诉或正当理由的主张，并持有托管的第三把钥匙。",
    },
    tie_breaker: {
      term: "裁决人",
      aka: ["tie-breaker"],
      said: "委托中没有仲裁人时，由委托方指定来裁决申诉的人。",
    },
    inspector: {
      term: "检验人",
      aka: ["核验人", "评估人", "inspector"],
      said: "封面页上指定的独立人士，查看完成的成果并对其签署意见。该意见只是建议，检验人不持有托管钥匙。",
    },
    audience: {
      term: "受邀承接方",
      aka: ["圈子", "受邀者", "audience"],
      said: "委托方邀请参与某项委托的 npub。只有他们能看到并承接该委托。",
    },
    offer: {
      term: "要约",
      aka: ["签署的要约", "报价", "offer"],
      said: "一份写明委托全部条款的简明文本。委托方、承接方，以及仲裁人和检验人（如有），各自签署同一份文本。",
    },
    cover_page: {
      term: "封面页",
      aka: ["具体事项", "cover page"],
      said: "一项委托在标准条款下的具体事项：交付物、参与者、各项期限、托管和法律选择。",
    },
    standard_terms: {
      term: "标准条款",
      aka: ["条款与条件", "合同", "Standard Terms"],
      said: "每项委托所依据的合同，可在标准条款页面阅读。封面页填写其中的具体事项。",
    },
    deliverable: {
      term: "交付物",
      aka: ["deliverable"],
      said: "承接方要交出的一项东西，在封面页上每行一项。",
    },
    spec_link: {
      term: "规格说明",
      aka: ["规格", "说明书", "spec"],
      said: "指向工作完整描述的链接，用于委托简介写不下的内容。",
    },
    spec_hash: {
      term: "规格说明的 sha256",
      aka: ["规格哈希", "指纹", "spec hash"],
      said: "规格说明文件的指纹，让双方都能证明他们签署时所指的文件，就是链接上的那个文件。",
    },
    grade: {
      term: "评级",
      aka: ["评分", "等级", "grade"],
      said: "成果可被评定的一个水平，以及它对应的 sats。委托方为交付评级，最高评级即为价格。",
    },
    rubric: {
      term: "评级标准",
      aka: ["评级", "标准", "rubric"],
      said: "评级的列表，每个评级都有对应的 sats 和达到它的条件。",
    },
    ip_terms: {
      term: "知识产权",
      aka: ["IP", "所有权", "版权", "授权"],
      said: "完成的成果归谁所有，以及各方可以如何使用它，在封面页上选定。",
    },
    governing_law: {
      term: "适用法律",
      aka: ["法律", "争议解决地", "管辖", "governing law"],
      said: "解释协议所依据的法律，以及审理争议的地点。",
    },
    needed_by: {
      term: "需求日期",
      aka: ["到期日", "截止日期", "deadline"],
      said: "委托方需要收到交付的日期。",
    },
    late_terms: {
      term: "如果工作延误",
      aka: ["延误", "分级扣减", "折扣", "late"],
      said: "延误的交付可得多少：全额评级酬金、每天扣减一定比例、在设定时间分级扣减，或委托作为逾期关闭。",
    },
    failure_point: {
      term: "未交付",
      aka: ["交付失败", "逾期", "failure"],
      said: "需求日期之后、尚未交付的委托即告结束的时间点。若无正当理由，托管款和已交出的作品归委托方所有。",
    },
    deemed_acceptance: {
      term: "视为验收",
      aka: ["默认评级", "沉默", "deemed acceptance"],
      said: "交付在约定天数内未被评级，即按约定的评级视为已评级。这样，沉默就扣不住 sats。",
    },
    appeal_window: {
      term: "申诉期限",
      aka: ["申诉", "appeal"],
      said: "承接方在评级后提出申诉、或在未交付后提出正当理由的期限。在封面页上约定。",
    },
    ruling_time: {
      term: "仲裁人裁决的期限",
      aka: ["裁决期限", "ruling"],
      said: "仲裁人或裁决人对申诉或正当理由的主张作出决定的期限。在封面页上约定。",
    },
    payment_window: {
      term: "付款期限",
      aka: ["付款", "payment"],
      said: "评级确定后，委托方付款的期限。在封面页上约定。",
    },
    deposit: {
      term: "定金",
      aka: ["承接定金", "预付款", "deposit"],
      said: "最高评级价格的一部分，在承接方的承接被接受时支付给承接方。",
    },
    milestone: {
      term: "里程碑",
      aka: ["阶段", "分期", "milestone"],
      said: "最高评级价格的一部分，在工作进行期间于其自己的日期到期支付。",
    },
    paid_ahead: {
      term: "预付",
      aka: ["已预付", "paid ahead"],
      said: "定金与里程碑款项合计，最多为价格的 90%。其余部分按评级结算。",
    },
    balance: {
      term: "余额",
      aka: ["尾款", "余款", "balance"],
      said: "评级对应的酬金，减去已支付的定金和里程碑款项。委托方通过 Lightning 发票支付。",
    },
    escrow: {
      term: "托管",
      aka: ["托管款", "escrow"],
      said: "最高评级价格减去已预付的部分，存放在 Cashu 铸币所，并锁定到委托方、承接方和仲裁人的密钥。其中任意两人即可按份额释放它。",
    },
    mint: {
      term: "铸币所",
      aka: ["Cashu", "电子现金", "ecash", "mint"],
      said: "以锁定到三把密钥的电子现金形式，保管托管 sats 的 Cashu 服务。",
    },
    refund_after: {
      term: "退款日",
      aka: ["退款天数", "时间锁", "refund"],
      said: "需求日期之后的天数，自那天起委托方可单独取回托管。",
    },
    sat: {
      term: "sat",
      aka: ["sats", "聪", "satoshi"],
      said: "比特币的最小单位：一亿 sats 等于一枚比特币。这里的每个价格都以 sats 计。",
    },
    bitcoin: {
      term: "比特币",
      aka: ["Bitcoin", "BTC"],
      said: "一种供应量固定的货币，不由任何政府发行，也不受任何银行控制。",
    },
    lightning: {
      term: "Lightning",
      aka: ["闪电网络", "闪电"],
      said: "建立在比特币之上、用于快速小额付款的支付网络。委托款项通过它支付。",
    },
    invoice: {
      term: "发票",
      aka: ["Lightning 发票", "收款请求", "invoice"],
      said: "一份要求支付确切数量 sats 的 Lightning 收款请求，带有有效期。",
    },
    lightning_address: {
      term: "Lightning 地址",
      aka: ["闪电地址", "收款地址", "Lightning address"],
      said: "形如 name@wallet.example 的地址，每次付款都会生成一张新发票。",
    },
    api_sats: {
      term: "api_sats",
      aka: ["工具费", "Tollbooth 额度"],
      said: "你 Tollbooth 钱包中的额度，用于支付每次使用 Task Booth 工具的小额费用。它与委托的款项是分开的。",
    },
    npub: {
      term: "npub",
      aka: ["公钥", "Nostr"],
      said: "你的 Nostr 公钥：别人认识你、邀请你以及你登录所用的名字。",
    },
    nsec: {
      term: "nsec",
      aka: ["私钥", "密钥"],
      said: "你的 Nostr 私钥。它以你的名义签名，所以要始终留在你自己手中。",
    },
    signature: {
      term: "签名",
      aka: ["签署", "已签署", "signature"],
      said: "你的 Nostr 密钥在一份文本上留下的标记，证明你同意的正是这些字句。每个签名都通过私信请求和给出。",
    },
    sha256: {
      term: "sha256",
      aka: ["哈希", "指纹", "hash"],
      said: "一段文本或一个文件的指纹：对它的任何改动都会改变指纹。",
    },
    reputation: {
      term: "信誉",
      aka: ["声誉", "记录", "reputation"],
      said: "一个 npub 在委托中担任的每个角色里的表现：委托方、承接方、仲裁人和检验人。任何人都可以查看。",
    },
    rank: {
      term: "等级",
      aka: ["新手", "参差", "可靠", "值得信赖", "模范", "rank"],
      said: "概括信誉的一个词：新手、参差、可靠、值得信赖或模范，依据完成了多少委托、其中多少进展顺利。每个等级从哪里开始，由 Operator 设定。",
    },
    claim_of_cause: {
      term: "正当理由的主张",
      aka: ["理由", "正当理由", "cause"],
      said: "承接方说明工作为何未能交付的理由，须在申诉期限内提出。仲裁人支持或驳回它，有正当理由的未交付计入方式不同。",
    },
    organization: {
      term: "组织",
      aka: ["机构", "团队", "organization"],
      said: "汇集项目的团体。其成员可以查看每个项目，并在其中发布委托。",
    },
    project: {
      term: "项目",
      aka: ["project"],
      said: "一组委托归入的地方，有预算和默认条款。每项新委托都归入一个项目。",
    },
    project_defaults: {
      term: "默认条款",
      aka: ["默认", "模板", "defaults"],
      said: "项目中新委托的起始条款。此后，每项委托保留自己的条款。",
    },
  },
};
