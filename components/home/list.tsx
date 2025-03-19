import clsx from "clsx"
import React from "react"

import { type DataProps } from "~/utils/constant"
import {
  DeviconAzure,
  DeviconCloudflare,
  DeviconDigitalocean,
  DeviconGooglecloud,
  DeviconLinkedin,
  DeviconNpm,
  LogosAws,
  LogosBitbucket,
  LogosDockerIcon,
  LogosFacebook,
  LogosGitlab,
  LogosRedditIcon,
  LogosTwitter,
  MdiGithub,
  SkillIconsDiscord,
  SkillIconsGmailLight,
  SkillIconsInstagram,
  VscodeIconsFileTypeOutlook
} from "~components/ui/icon"
import { getOtp, getProcessColor, getTimeRemaining } from "~utils"

const faviconMap: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  github: MdiGithub,
  npm: DeviconNpm,
  gitlab: LogosGitlab,
  bitbucket: LogosBitbucket,
  docker: LogosDockerIcon,
  aws: LogosAws,
  googlecloud: DeviconGooglecloud,
  azure: DeviconAzure,
  cloudflare: DeviconCloudflare,
  digitalocean: DeviconDigitalocean,
  twitter: LogosTwitter,
  facebook: LogosFacebook,
  instagram: SkillIconsInstagram,
  linkedin: DeviconLinkedin,
  discord: SkillIconsDiscord,
  reddit: LogosRedditIcon,
  gmail: SkillIconsGmailLight,
  outlook: VscodeIconsFileTypeOutlook
}

interface ListProps {
  data: DataProps[]
}

const List: React.FC<ListProps> = (props) => {
  const { data } = props
  return (
    <div className="flex-1 overflow-auto">
      {data.map((item) => {
        const { id } = item
        return <ListItem key={id} data={item} />
      })}
    </div>
  )
}

interface ListItemProps {
  data: DataProps
}

const ListItem: React.FC<ListItemProps> = (props) => {
  const { data } = props
  const { id, type, issuer, secret, account } = data
  const vendor = issuer.toLocaleLowerCase()
  const [opt, setOpt] = React.useState("")
  const [nextOpt, setNextOpt] = React.useState("")
  const [timeRemaining, setTimeRemaining] = React.useState<number>(null)
  const timer = React.useRef(null)

  React.useEffect(() => {
    calcOTP()
    timer.current = setInterval(() => {
      calcOTP()
    }, 1000)

    return () => {
      clearInterval(timer.current)
    }
  }, [])

  const calcOTP = () => {
    const opt = getOtp(secret)
    const nextOpt = getOtp(secret, true)
    const timeRemaining = getTimeRemaining()

    setOpt(opt)
    setNextOpt(nextOpt)
    setTimeRemaining(timeRemaining)
  }

  const Favicon = faviconMap[vendor]
  const color = getProcessColor(timeRemaining)
  return (
    <div className="bg-base-200 py-4 mb-2 rounded-lg relative overflow-hidden">
      <progress
        max={30}
        value={timeRemaining}
        className={`progress ${color} w-full absolute top-[0px] h-[3px] bg-base-200`}
      />
      <div className="px-4">
        <div className="flex justify-between items-center">
          <div className="font-medium text-lg">{issuer}</div>
          <div>
            <Favicon className="text-xl" />
          </div>
        </div>
        <div className="text-neutral/60 font-medium -translate-y-[2px]">
          {account}
        </div>
        <div className="mt-2 flex justify-between items-center">
          <div className="font-bold text-2xl text-primary">{opt}</div>
          <div className="text-neutral/60 font-medium">{nextOpt}</div>
        </div>
      </div>
    </div>
  )
}

export default List
