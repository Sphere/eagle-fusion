// export interface ISpeakerDetails {
//   SessionType: string,
//   SessionImage: string,
//   SessionTitle: string,
//   Speaker: string,
//   SessionStartTime: string,
//   SessionEndTime: string,
//   Attendees: string,
// }

export interface ISpeakerDetails {
  sessionID: string,
  speakerImage: string,
  speakerDate: string,
  speakerKeynote: string,
  speakerName: string,
  registeredUsers: string,
  startTime: string,
  endTime: string,
  speakerType: string,
  startRemainingTime?: number,
  endRemaningTime?: number,
  SessionDescription?: ISessionDetails
}

export interface ISessionDetails {
  PresenterPosition: string,
  Organization: string,
  Header1: string,
  Content1: string,
  Header2: string,
  Content2: string,
  Header3: string,
  Content3: IDownload,
  Header4: string,
  Content4: ILink,
}

export interface IDownload {
  DownloadLink1: string,
  DownloadLink2: string,
}

export interface ILink {
  Line1: string,
  Link1: string,
  Line2: string,
  Link2: string,
}
