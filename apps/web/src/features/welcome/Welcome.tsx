import {
  ArrowDown,
  ArrowRight,
  ChartNoAxesCombined,
  Check,
  Coffee,
  Compass,
  Menu,
  Pause,
  Play,
  Sprout,
  Wallet,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { useExperience } from "../../Experience";
import LifeScene from "./LifeScene";
import "./welcome.css";

const links = [
  ["kham-pha", "Khám phá"],
  ["tinh-nang", "Tính năng"],
  ["cam-hung", "Cảm hứng"],
  ["finora-access", "Tài khoản"],
];
const moments = [
  {
    id: "cafe",
    label: "Niềm vui mỗi ngày",
    icon: Coffee,
    title: "Một ly cà phê. Một khoảng thảnh thơi.",
    text: "Ghi lại những khoản chi nhỏ, để bạn biết mình đang dành tiền cho điều gì — và vẫn có chỗ cho những niềm vui quen thuộc.",
    action: "Ghi chép thu chi",
  },
  {
    id: "coast",
    label: "Chuyến đi mơ ước",
    icon: Compass,
    title: "Để chuyến đi không chỉ nằm trong dự định.",
    text: "Tách một khoản cho mục tiêu riêng, theo dõi từng lần đóng góp và nhìn hành trình tích lũy tiến gần hơn mỗi tháng.",
    action: "Theo dõi mục tiêu",
  },
  {
    id: "city",
    label: "Ngày mai vững vàng",
    icon: Sprout,
    title: "Giữa phố thị, giữ một nhịp sống của riêng mình.",
    text: "Lên kế hoạch cho tiền nhà, sinh hoạt và tiết kiệm. Xem trước phân bổ ngân sách rồi tự quyết định kế hoạch phù hợp với bạn.",
    action: "Lập ngân sách",
  },
] as const;

export default function Welcome() {
  const { quiet, toggle, reduced } = useExperience();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const menuButton = useRef<HTMLButtonElement>(null);
  const moment = moments[selected];
  const navigate = (id: string) => {
    setOpen(false);
    const target = document.getElementById(id);
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({
      behavior: reduced ? "instant" : "smooth",
      block: "start",
    });
  };
  return (
    <div className="welcome">
      <header
        className="welcome-header"
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            setOpen(false);
            menuButton.current?.focus();
          }
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setOpen(false);
        }}
      >
        <a
          className="welcome-brand"
          href="#kham-pha"
          aria-label="Finora — trang chào"
          onClick={(event) => {
            event.preventDefault();
            navigate("kham-pha");
          }}
        >
          <ChartNoAxesCombined size={24} />
          finora<span>.</span>
        </a>
        <button
          className="welcome-menu-toggle"
          ref={menuButton}
          aria-expanded={open}
          aria-controls="welcome-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />} Menu
        </button>
        <nav
          id="welcome-navigation"
          className={open ? "welcome-navigation is-open" : "welcome-navigation"}
          aria-label="Điều hướng trang chào"
        >
          {links.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(event) => {
                event.preventDefault();
                navigate(id);
              }}
            >
              {label}
              {id === "finora-access" && <ArrowRight size={15} />}
            </a>
          ))}
        </nav>
      </header>
      <section
        className="welcome-hero"
        id="kham-pha"
        tabIndex={-1}
        aria-label="Giới thiệu Finora"
      >
        <div className="welcome-hero-copy">
          <span className="welcome-kicker">
            <span /> MỘT NHỊP SỐNG NHẸ NHÀNG HƠN
          </span>
          <h2>
            Chăm chút hôm nay.
            <br />
            <em>Thảnh thơi</em>
            <br />
            ngày mai.
          </h2>
          <p>
            Tiền bạc cũng cần một chút quan tâm.
            <br />
            Cùng Finora hiểu chi tiêu, nuôi dưỡng thói quen tốt
            <br className="welcome-desktop-break" /> và dành chỗ cho những điều
            bạn yêu.
          </p>
          <button
            className="welcome-enter"
            onClick={() => navigate("finora-access")}
          >
            Bắt đầu cùng Finora <ArrowRight size={18} />
          </button>
          <a
            className="welcome-explore"
            href="#tinh-nang"
            onClick={(event) => {
              event.preventDefault();
              navigate("tinh-nang");
            }}
          >
            Khám phá cách Finora giúp bạn <ArrowDown size={15} />
          </a>
        </div>
        <div className="welcome-visual">
          <div className="welcome-arch">
            <LifeScene />
          </div>
          <span className="welcome-stamp">
            SỐNG CÓ KẾ HOẠCH
            <br />
            <Sprout size={28} />
            NHẸ LÒNG MỖI NGÀY
          </span>
          <div className="welcome-floating">
            <span>
              <Check size={17} />
            </span>
            <div>
              Mỗi bước nhỏ đều đáng giá
              <small>Tích lũy cho những điều quan trọng</small>
            </div>
          </div>
          <span className="welcome-art-label">
            MINH HỌA · NHỊP SỐNG BÊN DÒNG SÔNG
          </span>
        </div>
        <button
          className="welcome-motion"
          aria-pressed={quiet}
          onClick={toggle}
        >
          {quiet ? <Play size={14} /> : <Pause size={14} />}
          {quiet ? "Bật chuyển động trang chào" : "Tạm dừng chuyển động"}
        </button>
      </section>
      <div className="welcome-ribbon" aria-label="Giá trị của Finora">
        <span>Hiểu dòng tiền</span>
        <i aria-hidden="true">✳</i>
        <span>Chi tiêu có chủ đích</span>
        <i aria-hidden="true">✳</i>
        <span>Tích lũy từng chút</span>
        <i aria-hidden="true">✳</i>
        <span>Sống nhẹ lòng hơn</span>
      </div>
      <section
        className="welcome-features"
        id="tinh-nang"
        tabIndex={-1}
        aria-labelledby="features-title"
      >
        <div className="welcome-section-heading">
          <span className="welcome-kicker">01 / ĐỒNG HÀNH CÙNG BẠN</span>
          <h2 id="features-title">
            Một nơi cho tiền bạc.
            <br />
            <em>Nhiều chỗ hơn cho cuộc sống.</em>
          </h2>
          <p>
            Từ khoản chi đầu ngày đến kế hoạch dài hạn,
            <br />
            mọi thứ rõ ràng để bạn chủ động lựa chọn.
          </p>
        </div>
        <div className="welcome-feature-grid">
          {[
            {
              icon: Wallet,
              title: "Thu chi trong tầm tay",
              text: "Quản lý nhiều ví, ghi lại giao dịch và tìm lại từng khoản chi khi cần.",
              tag: "01 · GHI CHÉP",
            },
            {
              icon: ChartNoAxesCombined,
              title: "Ngân sách có nhịp điệu",
              text: "Gợi ý phân bổ theo thu nhập và nhu cầu. Xem trước, điều chỉnh rồi xác nhận.",
              tag: "02 · CÂN ĐỐI",
            },
            {
              icon: Sprout,
              title: "Ước mơ có lộ trình",
              text: "Dành tiền cho mục tiêu, theo dõi tiến độ và lên lịch các khoản định kỳ.",
              tag: "03 · TÍCH LŨY",
            },
          ].map(({ icon: Icon, title, text, tag }) => (
            <article className="welcome-feature" key={title}>
              <span className="welcome-feature-icon">
                <Icon size={29} strokeWidth={1.4} />
              </span>
              <small>{tag}</small>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section
        className="welcome-moments"
        id="cam-hung"
        tabIndex={-1}
        aria-labelledby="moments-title"
      >
        <div className="welcome-section-heading">
          <span className="welcome-kicker">02 / NHỮNG ĐIỀU ĐÁNG DÀNH DỤM</span>
          <h2 id="moments-title">
            Kế hoạch nhỏ.<em> Cuộc sống đầy màu.</em>
          </h2>
          <p>Cảm hứng từ những khoảnh khắc gần gũi trong đời sống Việt Nam.</p>
        </div>
        <div
          className="welcome-moment-options"
          role="group"
          aria-label="Chọn cảm hứng"
        >
          {moments.map(({ label, icon: Icon }, index) => (
            <button
              key={label}
              aria-pressed={selected === index}
              onClick={() => setSelected(index)}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>
        <div className="welcome-moment-panel">
          <div className="welcome-moment-art">
            <LifeScene scene={moment.id} />
            <span>MINH HỌA CẢM HỨNG</span>
          </div>
          <div
            className="welcome-moment-copy"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="welcome-kicker">{`0${selected + 1} / ${moment.label}`}</span>
            <h3>{moment.title}</h3>
            <p>{moment.text}</p>
            <button
              className="welcome-text-link"
              onClick={() => navigate("finora-access")}
            >
              {moment.action} <ArrowRight size={18} />
            </button>
            <small>
              Tình huống minh họa, không phải dữ liệu hay lời chứng thực của
              người dùng.
            </small>
          </div>
        </div>
      </section>
      <section className="welcome-note" aria-label="Triết lý Finora">
        <span className="editorial-rule" aria-hidden="true">
          — · —
        </span>
        <h2>
          “Đủ cho hôm nay.
          <br />
          Dành cho ngày mai.”
        </h2>
        <p>Không cần bắt đầu thật lớn. Chỉ cần bắt đầu từ hôm nay.</p>
        <a
          href="#finora-access"
          onClick={(event) => {
            event.preventDefault();
            navigate("finora-access");
          }}
        >
          Ghé không gian tài chính của bạn <ArrowRight size={17} />
        </a>
      </section>
    </div>
  );
}
