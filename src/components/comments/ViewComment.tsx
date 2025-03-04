import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons'
import { Alert, Button, Tag, Tooltip } from 'antd'
import clsx from 'clsx'
import dayjs from 'dayjs'
import Link from 'next/link'
import { FC, useEffect, useState } from 'react'
import { TbCoins, TbMessageCircle2 } from 'react-icons/tb'
import { getNeededLock } from 'src/config/constants'
import { useSelectProfile } from 'src/rtk/app/hooks'
import { useFetchTotalStake } from 'src/rtk/features/creators/totalStakeHooks'
import {
  asCommentData,
  asCommentStruct,
  CommentContent,
  PostStruct,
  PostWithSomeDetails,
  SpaceStruct,
} from 'src/types'
import { activeStakingLinks } from 'src/utils/links'
import { useMyAddress } from '../auth/MyAccountsContext'
import { FormatBalance } from '../common/balances'
import { ShareDropdown } from '../posts/share/ShareDropdown'
import { useShouldRenderMinStakeAlert } from '../posts/view-post'
import { PostDropDownMenu } from '../posts/view-post/PostDropDownMenu'
import PostRewardStat from '../posts/view-post/PostRewardStat'
import AuthorSpaceAvatar from '../profiles/address-views/AuthorSpaceAvatar'
import Name from '../profiles/address-views/Name'
import { equalAddresses } from '../substrate'
import { postUrl } from '../urls'
import { formatDate, IconWithLabel, useIsHidden } from '../utils'
import { MutedSpan } from '../utils/MutedText'
import { Pluralize } from '../utils/Plularize'
import SuperLike from '../voting/SuperLike'
import { CommentEventProps } from './CommentEditor'
import { ViewCommentsTree } from './CommentTree'
import { NewComment } from './CreateComment'
import { CommentBody } from './helpers'
import { EditComment } from './UpdateComment'
import { useRepliesData } from './utils'

type Props = {
  space?: SpaceStruct
  rootPost?: PostStruct
  comment: PostWithSomeDetails
  withShowReplies?: boolean
  eventProps: CommentEventProps
  showAllReplies: boolean
}

export const InnerViewComment: FC<Props> = props => {
  const {
    space = { id: 0 } as any as SpaceStruct,
    rootPost,
    comment: commentDetails,
    withShowReplies = false,
    eventProps,
    showAllReplies,
  } = props

  const { post: comment } = commentDetails
  const shouldRenderAlert = useShouldRenderMinStakeAlert(comment.struct)

  const commentStruct = asCommentStruct(comment.struct)
  const commentContent = comment.content as CommentContent
  const { id, createdAtTime, ownerId } = commentStruct

  const myAddress = useMyAddress() ?? ''
  const { data: totalStake } = useFetchTotalStake(myAddress)

  const owner = useSelectProfile(ownerId)

  const [showEditForm, setShowEditForm] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)

  const { hasReplies, replyCountWithFake } = useRepliesData(commentStruct)

  const [showReplies, setShowReplies] = useState(withShowReplies && hasReplies)

  useEffect(() => {
    setShowReplies(withShowReplies && hasReplies)
  }, [hasReplies])

  const isFake = id.startsWith('fake')
  const commentLink = postUrl(space, comment)
  const isRootPostOwner = equalAddresses(rootPost?.ownerId, commentStruct.ownerId)

  const ViewRepliesLink = () => {
    const viewActionMessage = showReplies ? (
      <>
        <CaretUpOutlined /> {'Hide'}
      </>
    ) : (
      <>
        <CaretDownOutlined /> {'View'}
      </>
    )

    return (
      <>
        <Link href={commentLink}>
          <a
            onClick={event => {
              event.preventDefault()
              setShowReplies(!showReplies)
            }}
          >
            {viewActionMessage}{' '}
            <Pluralize count={replyCountWithFake || 0} singularText='reply' pluralText='replies' />
          </a>
        </Link>
      </>
    )
  }

  const onEditComment = () => setShowEditForm(true)

  const newCommentForm = showReplyForm && (
    <NewComment
      eventProps={eventProps}
      autoFocus
      post={commentStruct}
      onCancel={() => setShowReplyForm(false)}
      onSuccess={() => setShowReplyForm(false)}
      withCancel
    />
  )

  return (
    <div className={clsx('w-100', isFake ? 'DfDisableLayout pb-3' : '')}>
      <div className={clsx('d-flex align-items-start w-100')}>
        <AuthorSpaceAvatar size={32} authorAddress={ownerId} />
        <div className='d-flex flex-column w-100'>
          <div className='d-flex align-items-center justify-content-between GapTiny'>
            <div className='d-flex align-items-baseline GapSemiTiny'>
              <div className='d-flex align-items-baseline GapSemiTiny'>
                <Name
                  className='!ColorMuted !FontWeightNormal FontSmall'
                  address={ownerId}
                  owner={owner}
                  asLink
                />
                {isRootPostOwner && (
                  <Tag color='blue' className='mr-0'>
                    <Tooltip title='Original Poster'>OP</Tooltip>
                  </Tag>
                )}
              </div>
              <MutedSpan>&middot;</MutedSpan>
              <Link href='/[spaceId]/[slug]' as={commentLink}>
                <a className='DfGreyLink FontTiny' title={formatDate(createdAtTime)}>
                  {dayjs(createdAtTime).fromNow()}
                </a>
              </Link>
            </div>
            <div className='d-flex align-items-center GapTiny'>
              {!isFake && (
                <>
                  <ShareDropdown
                    postDetails={commentDetails}
                    space={space}
                    className='DfAction p-0'
                    iconSize='normal'
                  />
                  <PostDropDownMenu
                    className='d-flex align-items-center ColorMuted'
                    style={{ position: 'relative', top: '1px' }}
                    post={comment}
                    space={space}
                    onEditComment={onEditComment}
                  />
                </>
              )}
            </div>
          </div>
          <div className='mt-1'>
            {showEditForm ? (
              <EditComment
                eventProps={eventProps}
                struct={commentStruct}
                content={commentContent}
                onCancel={() => setShowEditForm(false)}
                onSuccess={() => setShowEditForm(false)}
              />
            ) : (
              <CommentBody comment={asCommentData(comment)} />
            )}
          </div>
          <div
            className='d-flex align-items-center mt-1.5'
            style={{ flexWrap: 'wrap-reverse', gap: '0 0.75rem' }}
          >
            <div className='d-flex align-items-center GapSmall'>
              <SuperLike
                isComment
                key={`voters-of-comments-${id}`}
                className='!FontTiny'
                iconClassName='!FontSmall'
                post={commentStruct}
              />
              <Button
                key={`reply-comment-${id}`}
                className='p-0'
                style={{ border: 'none', boxShadow: 'none', background: 'transparent' }}
                onClick={() => setShowReplyForm(true)}
              >
                <span className='d-flex align-items-center ColorMuted'>
                  <IconWithLabel icon={<TbMessageCircle2 className='FontNormal' />} label='Reply' />
                </span>
              </Button>
            </div>
            {shouldRenderAlert && (
              <Alert
                style={{ border: 'none', padding: '0.125rem 0.5rem' }}
                className='RoundedLarge'
                type='warning'
                message={
                  <Tooltip
                    title={
                      <span>
                        <span>
                          Lock{' '}
                          <FormatBalance
                            currency='SUB'
                            value={getNeededLock(totalStake?.amount).toString()}
                            precision={2}
                            withMutedDecimals={false}
                          />{' '}
                          more in order to earn rewards for this comment.
                        </span>
                        <Link href={activeStakingLinks.learnMore}>
                          <a
                            target='_blank'
                            className='FontWeightMedium ml-1'
                            style={{ color: '#f759ab' }}
                          >
                            Learn How
                          </a>
                        </Link>
                      </span>
                    }
                  >
                    <div className='d-flex align-items-center GapTiny' style={{ color: '#bd7d05' }}>
                      <TbCoins />
                      <span>Not monetized</span>
                    </div>
                  </Tooltip>
                }
              />
            )}
            <PostRewardStat postId={comment.id} style={{ marginLeft: 'auto' }} />
          </div>
          <div className='mt-1.5 d-flex flex-column'>
            {newCommentForm}
            {hasReplies && (
              <div className='pb-2'>
                {!withShowReplies && <ViewRepliesLink />}
                {showReplies && rootPost?.id && (
                  <ViewCommentsTree
                    rootPostId={rootPost.id}
                    showAllReplies={showAllReplies}
                    eventProps={{ ...eventProps, level: eventProps.level + 1 }}
                    parentId={commentStruct.id}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export const ViewComment = (props: Props) => {
  const isHiddenComment = useIsHidden(props.comment.post)
  if (!props.comment || isHiddenComment) return null

  return <InnerViewComment {...props} />
}

export default ViewComment
