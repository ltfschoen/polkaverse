import GeneralLeaderboardPage from 'src/components/leaderboard/GeneralLeaderboardPage'
import { getInitialPropsWithRedux } from 'src/rtk/app'
import { fetchGeneralStatistics } from 'src/rtk/features/leaderboard/generalStatisticsSlice'
import { fetchLeaderboardData } from 'src/rtk/features/leaderboard/leaderboardSlice'

getInitialPropsWithRedux(GeneralLeaderboardPage, async ({ dispatch }) => {
  await Promise.all([
    dispatch(fetchGeneralStatistics({ reload: true })),
    dispatch(fetchLeaderboardData({ role: 'STAKER' })),
    dispatch(fetchLeaderboardData({ role: 'CREATOR' })),
  ])
  return {}
})

export default GeneralLeaderboardPage
