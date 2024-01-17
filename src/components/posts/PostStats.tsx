import { nonEmptyStr } from '@subsocial/utils'
import { useState } from 'react'
import { idToBn, PostStruct } from 'src/types'
import { MutedSpan } from '../utils/MutedText'
import { Pluralize } from '../utils/Plularize'
import { ActiveVoters, PostVoters } from '../voting/ListVoters'

type StatsProps = {
  post: PostStruct
  goToCommentsId?: string
}

export const StatsPanel = (props: StatsProps) => {
  const { post, goToCommentsId } = props

  const [commentsSection, setCommentsSection] = useState(false)
  const [postVotersOpen, setPostVotersOpen] = useState(false)

  const {
    // upvotesCount, downvotesCount, sharesCount
    repliesCount,
    id,
  } = post

  // const reactionsCount = upvotesCount + downvotesCount
  // const showReactionsModal = () => reactionsCount && setPostVotersOpen(true)

  const toggleCommentsSection = goToCommentsId
    ? undefined
    : () => setCommentsSection(!commentsSection)
  const comments = <Pluralize count={repliesCount || 0} singularText='Comment' />

  return (
    <>
      <div className='DfCountsPreview'>
        {/* <MutedSpan className={reactionsCount ? '' : 'disable'}>
          <span
            style={{ whiteSpace: 'nowrap' }}
            onClick={showReactionsModal}
            className={clsx(reactionsCount > 0 && 'DfMutedLink')}
          >
            <Pluralize count={reactionsCount} singularText='Reaction' />
          </span>
        </MutedSpan> */}
        <MutedSpan>
          {nonEmptyStr(goToCommentsId) ? (
            <a className='DfMutedLink' href={'#' + goToCommentsId} style={{ whiteSpace: 'nowrap' }}>
              {comments}
            </a>
          ) : (
            <span onClick={toggleCommentsSection} style={{ whiteSpace: 'nowrap' }}>
              {comments}
            </span>
          )}
        </MutedSpan>
        {/* {
          <MutedSpan style={{ whiteSpace: 'nowrap' }}>
            <Pluralize count={sharesCount || 0} singularText='Share' />
          </MutedSpan>
        } */}
        {/* <MutedSpan><Pluralize count={score} singularText='Point' /></MutedSpan> */}
      </div>
      <PostVoters
        id={idToBn(id)}
        active={ActiveVoters.All}
        open={postVotersOpen}
        close={() => setPostVotersOpen(false)}
      />
    </>
  )
}
