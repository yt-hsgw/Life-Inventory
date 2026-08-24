/**
 * Design reminder — 静かな編集室:
 * Warm editorial paper, lichen-olive accents, asymmetric paper-like sections,
 * and reflective product language. Avoid urgency, sales pressure, and dense grids.
 */
import {
  ArrowDownRight,
  ArrowRight,
  Camera,
  Check,
  CircleGauge,
  CreditCard,
  ListChecks,
  Menu,
  Package,
  Plus,
  Target,
} from "lucide-react";
import { useState } from "react";

const appShot = "/images/lp-login-preview.webp";
const logoMark = "/app-icon.svg";
const heroImage = "/images/lp-hero.webp";
const objectsImage = "/images/lp-objects.webp";
const reviewImage = "/images/lp-review.webp";
const idealImage = "/images/lp-ideal.webp";

const navItems = [
  { label: "考え方", href: "#philosophy" },
  { label: "できること", href: "#features" },
  { label: "画面を見る", href: "#product" },
];

const features = [
  {
    number: "01",
    title: "今の持ち物を、\n見渡す。",
    text: "カテゴリや状態ごとに整理して、何を持っているかを静かに把握できます。追加は、名前・カテゴリ・数量の3つから。",
    icon: Package,
    detail: "最短3入力で記録",
  },
  {
    number: "02",
    title: "ひとつずつ、\n自分の基準で。",
    text: "残す、迷う、手放す。答えを急がず、一品ずつ自分の言葉で判断を残せます。",
    icon: ListChecks,
    detail: "KEEP / MAYBE / RELEASE",
  },
  {
    number: "03",
    title: "理想との差を、\n確かめる。",
    text: "「今」と「理想」の数量、そして固定費を一緒に見る。暮らしを整える次の行動が見えてきます。",
    icon: Target,
    detail: "今・理想・差を比較",
  },
];

function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <a
      href="#top"
      className={`wordmark ${light ? "wordmark-light" : ""}`}
      aria-label="Life Inventory トップへ"
    >
      <span className="wordmark-mark">
        <img src={logoMark} alt="" />
      </span>
      <span>LIFE INVENTORY</span>
    </a>
  );
}

function MiniDashboard() {
  return (
    <div
      className="mini-app"
      aria-label="Life Inventoryのインベントリ画面イメージ"
    >
      <aside className="mini-sidebar">
        <div className="mini-app-mark">
          <img src={logoMark} alt="" />
        </div>
        <div className="mini-nav active">
          <CircleGauge />
          <span>インベントリ</span>
        </div>
        <div className="mini-nav">
          <Package />
          <span>持ち物</span>
        </div>
        <div className="mini-nav">
          <ListChecks />
          <span>見直し</span>
        </div>
        <div className="mini-nav">
          <Target />
          <span>理想</span>
        </div>
        <div className="mini-nav">
          <CreditCard />
          <span>固定費</span>
        </div>
      </aside>
      <div className="mini-content">
        <div className="mini-heading">
          <div>
            <span className="mini-eyebrow">暮らしの全体像</span>
            <h3>インベントリ</h3>
            <p>今の状態と理想との差を、判断を急がずに見渡します。</p>
          </div>
          <span className="mini-date">2026.08</span>
        </div>
        <div className="mini-metrics">
          <div>
            <span>今の持ち物</span>
            <strong>48</strong>
          </div>
          <div className="metric-accent">
            <span>理想の持ち物</span>
            <strong>36</strong>
          </div>
          <div>
            <span>差</span>
            <strong>−12</strong>
          </div>
        </div>
        <div className="mini-bottom-grid">
          <div className="mini-category-card">
            <div className="mini-card-head">
              <span>カテゴリ別</span>
              <ArrowRight />
            </div>
            {[
              ["衣類", 82],
              ["書籍", 48],
              ["キッチン", 64],
            ].map(([label, width]) => (
              <div className="mini-bar-row" key={String(label)}>
                <span>{label}</span>
                <i>
                  <b style={{ width: `${width}%` }} />
                </i>
              </div>
            ))}
          </div>
          <div className="mini-review-card">
            <ListChecks />
            <strong>5</strong>
            <span>
              件の持ち物が
              <br />
              見直し待ち
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewCard() {
  return (
    <div className="review-demo" aria-label="見直し画面のイメージ">
      <div className="review-demo-top">
        <span>見直し</span>
        <span>2 / 5</span>
      </div>
      <div className="review-progress">
        <span />
      </div>
      <p className="review-category">衣類　·　最後に使った日：2026.07.21</p>
      <h3>リネンのシャツ</h3>
      <p className="review-note">
        夏の外出に着る一枚。気持ちよく着られるか、次に使う場面を思い出してみる。
      </p>
      <div className="review-choice-row">
        <span>いまの判断</span>
        <b>MAYBE</b>
      </div>
      <div className="review-buttons">
        <button type="button">残す</button>
        <button type="button" className="selected">
          もう少し考える
        </button>
        <button type="button">手放す</button>
      </div>
    </div>
  );
}

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div id="top" className="site-shell">
      <header className="site-header">
        <Wordmark />
        <nav className="desktop-nav" aria-label="ページ内ナビゲーション">
          {navItems.map(item => (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <a href="#start" className="header-cta">
          アプリを見る <ArrowDownRight />
        </a>
        <button
          className="mobile-menu-button"
          type="button"
          aria-label="メニューを開く"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <Menu />
        </button>
        {mobileOpen && (
          <nav className="mobile-nav" aria-label="モバイルナビゲーション">
            {navItems.map(item => (
              <a
                onClick={() => setMobileOpen(false)}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      <main>
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-dark-panel">
            <span className="section-kicker light-kicker">
              LIFE, AT A GLANCE
            </span>
            <div className="hero-copy">
              <p className="hero-prelude">自分の基準で、暮らしを選ぶ。</p>
              <h1 id="hero-title">
                持ち物から、
                <br />
                <em>暮らしを整える。</em>
              </h1>
              <p className="hero-description">
                何を持ち、何を残し、どんな生活をつくりたいか。数字を減らすためではなく、自分の基準を見つけるための場所です。
              </p>
              <a className="hero-link" href="#features">
                できることを見る <ArrowDownRight />
              </a>
            </div>
            <div className="hero-footnote">
              <span>今の持ち物　·　見直し　·　理想</span>
              <span className="hero-statuses">
                <i>48</i> CURRENT <b>·</b>
                <i className="olive-number">36</i> IDEAL <b>·</b>
                <i>−12</i> GAP
              </span>
            </div>
          </div>
          <div className="hero-light-panel">
            <div
              className="hero-quiet-image"
              style={{ backgroundImage: `url(${heroImage})` }}
              aria-hidden="true"
            />
            <div className="hero-index">
              <span>01</span>
              <span>INTRODUCTION</span>
            </div>
            <div className="product-shot-wrap">
              <div className="shot-label">
                <span>PRODUCT PREVIEW</span>
                <span>LOGIN / DESKTOP</span>
              </div>
              <img
                src={appShot}
                alt="Life Inventoryのログイン画面を表現した紹介イメージ。暗い導入パネルとログインフォームで構成されている。"
                className="actual-app-shot"
              />
              <span className="shot-caption">ログイン画面の紹介イメージ</span>
            </div>
          </div>
        </section>

        <section id="philosophy" className="philosophy-section">
          <div className="editorial-label">
            <span>02</span>
            <span>PHILOSOPHY</span>
          </div>
          <div className="philosophy-copy">
            <p className="section-kicker">
              減らすためではなく、残したいものを知るために。
            </p>
            <h2>
              余白ができると、
              <br />
              暮らしの輪郭が見えてくる。
            </h2>
            <div className="philosophy-body">
              <p>
                Life
                Inventoryは、持ち物の数を競うためのアプリではありません。いま手元にあるもの、理想の状態、毎月続く支出を見渡して、自分にとって心地よい基準を少しずつつくるための場所です。
              </p>
              <p>
                答えはすぐに出なくて大丈夫。まずは、ひとつずつ記録するところから。
              </p>
            </div>
          </div>
          <div
            className="philosophy-image"
            style={{ backgroundImage: `url(${objectsImage})` }}
            aria-label="余白を持って置かれた日用品のイメージ"
          >
            <span className="observation-tag">
              <img src={logoMark} alt="" /> OBSERVATION / 01
            </span>
          </div>
        </section>

        <section id="features" className="feature-section">
          <div className="feature-header">
            <div className="editorial-label">
              <span>03</span>
              <span>FEATURES</span>
            </div>
            <p>
              暮らしを構成する情報を、
              <br />
              ひとつの視点に。
            </p>
          </div>
          <div className="feature-list">
            {features.map(feature => {
              const Icon = feature.icon;
              return (
                <article className="feature-item" key={feature.number}>
                  <div className="feature-number">{feature.number}</div>
                  <div className="feature-icon">
                    <Icon />
                  </div>
                  <h3>
                    {feature.title.split("\n").map(line => (
                      <span key={line}>{line}</span>
                    ))}
                  </h3>
                  <p>{feature.text}</p>
                  <div className="feature-detail">
                    <Check />
                    <span>{feature.detail}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section id="product" className="product-section">
          <div className="product-intro">
            <div className="editorial-label">
              <span>04</span>
              <span>THE PRODUCT</span>
            </div>
            <p className="section-kicker">見渡す。決める。少し整える。</p>
            <h2>
              日々の選択が、
              <br />
              静かに積み重なる。
            </h2>
            <p>
              インベントリを入口に、見直し・理想・固定費を行き来できます。画面を移るたびに、いまの暮らしを少し違う角度から見直せます。
            </p>
          </div>
          <div className="product-demo-wrap">
            <span className="demo-label">DASHBOARD / PREVIEW</span>
            <MiniDashboard />
            <p className="demo-disclosure">
              画面構成は実装済みアプリのインベントリ画面を基にした紹介イメージです。
            </p>
          </div>
        </section>

        <section className="review-section">
          <div
            className="review-photo"
            style={{ backgroundImage: `url(${reviewImage})` }}
            aria-label="見直しの時間を表す静物イメージ"
          >
            <span className="review-photo-note">
              <img src={logoMark} alt="" /> ITEM UNDER REVIEW
              <br />
              USE / KEEP / LET GO
            </span>
          </div>
          <div className="review-copy">
            <div className="editorial-label">
              <span>05</span>
              <span>REVIEW</span>
            </div>
            <p className="section-kicker">一度に決めなくていい。</p>
            <h2>
              答えを急がない、
              <br />
              見直しの時間。
            </h2>
            <p>
              迷っている持ち物だけを、一件ずつ表示。「残す」「もう少し考える」「手放す」を選び、そのときの判断を残していけます。
            </p>
            <a href="#start" className="text-link">
              見直しの流れを見る <ArrowRight />
            </a>
          </div>
          <ReviewCard />
        </section>

        <section className="ideal-section">
          <div className="ideal-copy">
            <div className="editorial-label">
              <span>06</span>
              <span>IDEAL &amp; COST</span>
            </div>
            <p className="section-kicker">今と理想の間に、次の行動がある。</p>
            <h2>
              足りないものも、
              <br />
              多すぎるものも。
            </h2>
            <p>
              理想の持ち物を登録すると、現在との差が見えます。固定費も月額・年額で整理し、ものとお金の両方から暮らしを見渡せます。
            </p>
            <div className="ideal-metric-row">
              <div>
                <span>Current</span>
                <b>48</b>
              </div>
              <i />
              <div className="olive">
                <span>Ideal</span>
                <b>36</b>
              </div>
              <i />
              <div>
                <span>Gap</span>
                <b>−12</b>
              </div>
            </div>
          </div>
          <div className="ideal-image-wrap">
            <div
              className="ideal-image"
              style={{ backgroundImage: `url(${idealImage})` }}
              aria-label="理想の暮らしを表す整ったクローゼットのイメージ"
            />
            <span>THE SPACE YOU WANT TO KEEP</span>
          </div>
        </section>

        <section id="camera" className="camera-section">
          <div className="camera-stage">
            <div className="camera-stage-rule" />
            <span className="camera-orbit orbit-one" />
            <span className="camera-orbit orbit-two" />
            <div className="camera-mark">
              <Camera />
            </div>
            <div className="camera-frame">
              <span />
              <span />
              <span />
              <span />
            </div>
            <p>
              FUTURE FEATURE
              <br />
              IN EXPLORATION
            </p>
          </div>
          <div className="camera-copy">
            <div className="editorial-label">
              <span>07</span>
              <span>IN EXPLORATION</span>
            </div>
            <p className="section-kicker">これから考えていく機能。</p>
            <h2>
              カメラを通して、
              <br />
              持ち物と出会い直す。
            </h2>
            <p>
              写真から持ち物を記録するカメラ機能を、今後の候補として検討しています。現在は設計・実装前の構想段階です。記録の負担を軽くしながら、ひとつひとつのものに目を向ける体験を、これから丁寧に考えていきます。
            </p>
            <span className="camera-status">
              <i /> PLANNED — NOT YET DESIGNED
            </span>
          </div>
        </section>

        <section id="start" className="closing-section">
          <div className="closing-rule" />
          <Wordmark light />
          <p className="closing-eyebrow">YOUR LIFE, YOUR CRITERIA</p>
          <h2>
            まずは、いまあるものを
            <br />
            見渡すところから。
          </h2>
          <p>暮らしの基準は、誰かの答えではなく、日々の選択からできていく。</p>
          <a href="#camera" className="closing-button">
            これからの構想を見る <ArrowDownRight />
          </a>
        </section>
      </main>

      <footer className="site-footer">
        <span>© {new Date().getFullYear()} LIFE INVENTORY</span>
        <span>Quietly make room for what matters.</span>
      </footer>
    </div>
  );
}
