import brandLogo from '../../assets/img_home/Frame 4.png'
import coverBg from '../../assets/Cover.png'

export default function AuthBrandSide() {
  return (
    <div
      className="authBrandPanel"
      aria-hidden="true"
      style={{
        '--authCoverBg': `url(${coverBg})`,
      }}
    >
      <img
        className="authBrandPanel__logo"
        src={brandLogo}
        alt=""
        width={320}
        height={120}
        loading="eager"
        decoding="async"
      />
    </div>
  )
}
