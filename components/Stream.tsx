import { useEffect, useState } from 'react'

import {
  Card,
  Image,
  Stack,
  CardBody,
  Heading,
  CardFooter,
  Button,
  Modal,
  ModalFooter,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Player } from '@livepeer/react'
import { useProvider, useSigner, useAccount } from 'wagmi'
import Superfluid from '../lib/superfluid'

const LIVY_TOKEN_ADDRESS = '0xd78F8d01516086676ae7Bf3dA0375C2CaC7ff550'

const flowRate = '385802469135802' // Equivalent to 10k per month

function Stream(props: any) {
  const { address, isConnected } = useAccount()

  // Handling joining a stream - starts here
  const provider = useProvider()

  const { data: signer } = useSigner()

  const [streamingFundsObject, setStreamingFundsObject] = useState({
    processingStartStream: false,
    processingEndStream: false,
    streaming: false,
  })

  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleStartMoneyStream = async (event: any) => {
    const superfluidInstance = new Superfluid()
    const chainId = (await provider.getNetwork()).chainId
    const sf = await superfluidInstance.sf(chainId, provider)
    setStreamingFundsObject({
      ...streamingFundsObject,
      processingStartStream: true,
    })
    const flow = await superfluidInstance.getFlow(
      sf,
      LIVY_TOKEN_ADDRESS,
      address as string,
      props.creatorAddress,
      provider,
    )
    if (flow.flowRate == '0') {
      const stream = await superfluidInstance.startFlow(
        sf,
        signer,
        LIVY_TOKEN_ADDRESS,
        address as string,
        props.creatorAddress,
        flowRate,
      )
      if (stream) {
        setStreamingFundsObject({
          ...streamingFundsObject,
          streaming: true,
          processingStartStream: false,
        })
      } else {
        setStreamingFundsObject({
          ...streamingFundsObject,
          streaming: false,
          processingStartStream: false,
        })
      }
    } else {
      alert('You are already streaming to this creator')
      setStreamingFundsObject({
        ...streamingFundsObject,
        streaming: true,
        processingStartStream: false,
      })
    }
  }
  // Handling joining a stream - ends here

  // Handling leaving a stream - start here
  const handleDeleteFlow = async (event: any) => {
    const superfluidInstance = new Superfluid()
    const chainId = (await provider.getNetwork()).chainId
    const sf = await superfluidInstance.sf(chainId, provider)
    setStreamingFundsObject({
      ...streamingFundsObject,
      processingEndStream: true,
    })
    const flow = await superfluidInstance.getFlow(
      sf,
      LIVY_TOKEN_ADDRESS,
      address as string,
      props.creatorAddress,
      provider,
    )
    if (flow.flowRate !== '0') {
      const stream = await superfluidInstance.deleteFlow(
        sf,
        signer,
        LIVY_TOKEN_ADDRESS,
        address as string,
        props.creatorAddress,
      )
      if (stream) {
        setStreamingFundsObject({
          ...streamingFundsObject,
          streaming: false,
          processingEndStream: false,
        })
        onClose()
      } else {
        setStreamingFundsObject({
          ...streamingFundsObject,
          processingStartStream: false,
        })
      }
    } else {
      setStreamingFundsObject({
        ...streamingFundsObject,
        streaming: false,
        processingStartStream: false,
      })
      onClose()
    }
  }
  // Handling leaving a stream - ends here

  return (
    <div>
      <Card
        direction={{ base: 'column', sm: 'row' }}
        overflow="hidden"
        variant="outline"
        marginTop="8"
      >
        <Image
          objectFit="cover"
          maxW={{ base: '100%', sm: '200px' }}
          src="https://images.unsplash.com/photo-1611162616475-46b635cb6868?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2874&q=80"
          alt="Video Icon"
        />
        <Stack>
          <CardBody>
            <Heading size="md">{props.name}</Heading>
          </CardBody>

          <CardFooter>
            {isConnected ? (
              !streamingFundsObject.streaming ? (
                !streamingFundsObject.processingStartStream ? (
                  <Button
                    variant="solid"
                    colorScheme={'teal'}
                    onClick={handleStartMoneyStream}
                  >
                    Start Stream
                  </Button>
                ) : (
                  <Button
                    variant="solid"
                    colorScheme={'teal'}
                    onClick={handleStartMoneyStream}
                    isLoading
                    loadingText="Starting..."
                  ></Button>
                )
              ) : (
                <Button variant="solid" colorScheme={'blue'} onClick={onOpen}>
                  Join Stream
                </Button>
              )
            ) : (
              <ConnectButton label="Sign in" />
            )}
            <Modal
              closeOnOverlayClick={false}
              isOpen={isOpen}
              onClose={onClose}
            >
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>{props.name}</ModalHeader>
                <ModalBody>
                  <Player
                    title={props.name}
                    playbackId={props.playbackId}
                    autoPlay
                    muted
                  />
                </ModalBody>

                <ModalFooter>
                  {streamingFundsObject.processingEndStream ? (
                    <Button
                      colorScheme="red"
                      mr={3}
                      isLoading
                      loadingText="Stopping..."
                    >
                      Leave Stream
                    </Button>
                  ) : (
                    <Button colorScheme="red" mr={3} onClick={handleDeleteFlow}>
                      Leave Stream
                    </Button>
                  )}
                  {/* <Button variant="ghost">Secondary Action</Button> */}
                </ModalFooter>
              </ModalContent>
            </Modal>
          </CardFooter>
        </Stack>
      </Card>
    </div>
  )
}

export default Stream
