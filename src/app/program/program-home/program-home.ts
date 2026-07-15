import { Component, computed, EventEmitter, Input, Output, signal, OnInit } from '@angular/core'
// import { Router } from '@angular/router'
import { Subject } from 'rxjs'
import { ValueService } from '../../../../library/ws-widget/utils/src/lib/services/value.service'
import { LoggerService } from '@ws-widget/utils'
import { PlaylistService } from '../../services/playlist.service'
// import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/public-api'

@Component({
  selector: 'ws-program-home',
  templateUrl: './program-home.html',
  styleUrl: './program-home.scss',
  standalone: false,
})
export class ProgramHome implements OnInit {
  @Input() configData: any
  @Input() userEnrollCourse: any
  @Output() programClick = new EventEmitter()
  isXSmall = computed(() => this.valueSvc.isMobile())
  isLoading = signal(true)
  programData = signal<any[]>([])
  cometencyData: { name: any; levels: string }[] = []
  public unsubscribe = new Subject<void>()
  programList: any
  showDetails = signal(false)
  constructor(
    private readonly valueSvc: ValueService,
    private readonly playlistSvc: PlaylistService,
    private readonly logger: LoggerService
    // private router: Router,
    // private configSvc: ConfigurationsService
  ) {
  }

  ngOnInit() {
    this.initializePrograms()
  }

  private initializePrograms(): void {
    this.logger.log('configData ', this.configData)
    this.playlistSvc.getPlaylistConfig().then(plyLsData => {
      const enrichedPrograms = this.configData?.programs?.map(
        this.enrichProgramWithCount(plyLsData, 'en')
      )

      this.logger.log('Section config in program list :', enrichedPrograms)
      this.programData.set(enrichedPrograms)
      this.isLoading.set(false)
    }).catch(err => {
      this.logger.error('Failed to load playlist config:', err)
      this.isLoading.set(false)
    })
  }

  enrichProgramWithCount = (playlists: any[], defaultLang: string) => (program: any): any => {
    let playlist = null
    if (program.type === 'course') {
      playlist = this.getStaticPlaylistForLang(playlists, program.playlistConfigId, defaultLang)
    } else if (program.type === 'competency') {
      playlist = this.getCompetencyPlaylistForLang(playlists, program.playlistConfigId)
    }

    const payload = playlist?.dataSource?.payload ?? []
    const courseCount = payload?.length

    // Filter enrolled courses matching payload ids
    const matchedCourses = this.userEnrollCourse?.filter(
      (course: any) => payload.includes(course.identifier)
    ) || []

    // Completed courses
    const completedCourses = matchedCourses.filter(
      (course: any) => course.completionPercentage === 100
    )
    let programStatus = ''

    if (matchedCourses.length > 0) {
      if (
        completedCourses.length === payload.length &&
        payload.length > 0
      ) {
        programStatus = 'Completed'
      } else {
        programStatus = 'In-Progress'
      }
    }

    return {
      ...program,
      courseCount,
      payload,
      programStatus,
    }
  }


  getStaticPlaylistForLang = (playlists: any[], playlistConfigId: string, defaultLang: string): any | null => {
    const playlist = playlists.find(
      p =>
        p.playlistId === playlistConfigId &&
        p?.dataSource?.type === 'static' &&
        p.language === defaultLang &&
        this.isValidPlaylist(p)
    )
    return playlist || null
  }
  getCompetencyPlaylistForLang = (playlists: any, playlistConfigId: string): any | null => {
    const playlist = playlists.find(
      p =>
        p.playlistId === playlistConfigId &&
        p?.dataSource?.type === 'competency' &&
        this.isValidPlaylist(p)
    )
    return playlist || null
  }

  isValidPlaylist = (playlist: any): boolean =>
    Boolean(
      playlist?.dataSource?.type &&
      Array.isArray(playlist?.dataSource?.payload) &&
      playlist.dataSource.payload.length > 0
    )

  // computeProgramStatus$ = (dashboardService: any, allCourseIds: string[], userId: string, enrichedPrograms: any[], playlists: any[], sections: Section[], defaultLang: string): Observable<any> => {
  //   return dashboardService.getProgramStatus$(allCourseIds, userId).pipe(
  //     map(({ completedIds, inProgressIds }: { completedIds: string[]; inProgressIds: string[] }) => {
  //       const programsWithStatus = enrichedPrograms.map((program) => {

  //         const programCourseIds: string[] = extractCourseIds(
  //           program,
  //           playlists,
  //           defaultLang
  //         )
  //         if (!programCourseIds.length) return program
  //         const completedCount = programCourseIds.filter((id) =>
  //           completedIds.includes(id)
  //         ).length

  //         const inProgressCount = programCourseIds.filter((id) =>
  //           inProgressIds.includes(id)
  //         ).length

  //         let programStatus = ''
  //         if (completedCount === programCourseIds.length) {
  //           programStatus = 'Completed'
  //         } else if (completedCount > 0 || inProgressCount > 0) {
  //           programStatus = 'In-Progress'
  //         }

  //         return { ...program, programStatus }
  //       })

  //       const updatedSections = sections.map((s) =>
  //         s.cardComponentType === 'ProgramList'
  //           ? { ...s, programs: programsWithStatus }
  //           : s
  //       )

  //       return {
  //         sections: updatedSections,
  //         playlists,
  //         enrolledData: emptyEnrollData(),
  //       }
  //     }),
  //     catchError((err) => {
  //       console.warn('[computeProgramStatus] getProgramStatus failed, skipping status:', err)
  //       const updatedSections = sections.map((s) =>
  //         s.cardComponentType === 'ProgramList'
  //           ? { ...s, programs: enrichedPrograms }
  //           : s
  //       )
  //       return of({
  //         sections: updatedSections,
  //         playlists,
  //         enrolledData: emptyEnrollData(),
  //       })
  //     })
  //   )
  // };
  openProgram(programData: any): void {
    this.programList = programData
    this.playlistSvc?.selectedProgram.set(programData)
    this.playlistSvc?.showDetails.set(true)
    this.showDetails.set(true)
  }
}