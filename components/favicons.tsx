import { clsx } from "clsx"
import cloudflare from "data-base64:~assets/cloudflare.png"
import github from "data-base64:~assets/github.png"
import React from "react"

import { useStorage } from "@plasmohq/storage/hook"

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
import { DEFAULT_SETTINGS, Issuers, StorageKey } from "~utils/constant"

export const minimalIconMap: Record<
  string,
  React.FC<React.SVGProps<SVGSVGElement>>
> = {
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

export const elegantImageMap: Record<string, string> = {
  github,
  cloudflare
}

const Favicon = ({ issuer }: { issuer: string }) => {
  const [settings] = useStorage(StorageKey.SETTINGS, DEFAULT_SETTINGS)
  const minimal = settings.faviconType === "minimal"
  const vendor = issuer.toLowerCase()
  const Icon = minimalIconMap[vendor]

  if (minimal) {
    return <Icon className="text-xl" />
  }
  const img = elegantImageMap[vendor]
  if (img) {
    return <img src={img} className="w-[120px] absolute right-0 -top-4" />
  }
  return <Icon className="text-2xl" />
}

export const FaviconMinimal = ({
  issuer,
  className
}: {
  issuer: string
  className?: string
}) => {
  const vendor = issuer.toLowerCase()
  const Icon = minimalIconMap[vendor]

  if (Icon) {
    return <Icon className={clsx("text-xl", className)} />
  }

  return issuer
}

export default Favicon
