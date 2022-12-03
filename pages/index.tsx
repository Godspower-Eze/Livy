import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

import Head from 'next/head'

import {
  Container,
  Box,
  Text,
  FormControl,
  Input,
  Button,
  Card,
  Image,
  Stack,
  CardBody,
  Heading,
  CardFooter,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Player } from '@livepeer/react'

export default function Home() {
  const { address, isConnected } = useAccount()

  // Handling starting of stream -- starts here
  const [startLivestreamObject, setStartLivestreamObject] = useState({
    title: '',
    processing: false,
    valid: false,
  })

  useEffect(() => {
    if (isConnected && startLivestreamObject.title !== '') {
      setStartLivestreamObject({ ...startLivestreamObject, valid: true })
    } else {
      setStartLivestreamObject({ ...startLivestreamObject, valid: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, startLivestreamObject.title])

  const handleStartStream = async () => {
    setStartLivestreamObject({ ...startLivestreamObject, processing: true })
    const response = await fetch('/api/streams/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `${startLivestreamObject.title}_${address}`,
      }),
    })
    const data = await response.json()
    const streamKey = data.streamKey
    setStartLivestreamObject({ ...startLivestreamObject, title: '' })
    alert(`Here is your stream key: ${streamKey}`)
  }

  const handleTitleChange = (event: any) => {
    setStartLivestreamObject({
      ...startLivestreamObject,
      title: event.target.value,
    })
  }
  // Handling starting of stream -- ends here

  // Handling get of streams - starts here
  const [streams, setStreams] = useState([])
  const [streamsNotEmpty, setstreamsNotEmpty] = useState(false)

  useEffect(() => {
    fetch('/api/streams')
      .then((res) => res.json())
      .then((data) => {
        setStreams(data)
        const _cleanedStreams: [] = data.map((value: { name: string }) => ({
          ...value,
          name: value.name.split('_')[0],
        }))
        const __cleanedStreams = _cleanedStreams.filter(
          (value: { isActive: boolean }) => {
            return value.isActive === true
          },
        )
        setStreams(__cleanedStreams)
        if (__cleanedStreams.length !== 0) {
          setstreamsNotEmpty(true)
        } else {
          setstreamsNotEmpty(false)
        }
      })
  }, [])
  // Handling get of streams - ends here

  // Handling joining a stream - starts here

  const { isOpen, onOpen, onClose } = useDisclosure()

  // Handling joining a stream - ends here

  return (
    <Container maxW="960px" bg="white">
      <Head>
        <title>Livy - Web3 Streaming</title>
      </Head>
      <Box height={100}>
        <Text fontSize="5xl" float="left" marginTop="3" marginLeft="7">
          Livy
        </Text>
        <Box padding={5} marginTop="4" float="right">
          <ConnectButton label="Sign in" showBalance={false} />
        </Box>
      </Box>
      <Box margin="6" bg="#ededed" borderRadius={10}>
        <Box padding={4}>
          <Text
            fontSize="2xl"
            fontFamily="mono"
            marginLeft="2"
            marginBottom="3"
          >
            Start a LiveStream
          </Text>
          <FormControl marginLeft="2">
            <Input
              type="text"
              placeholder="Enter Title"
              bg="white"
              onChange={handleTitleChange}
              value={startLivestreamObject.title}
            />
          </FormControl>
          {!startLivestreamObject.valid ? (
            <Button mt={4} ml={2} colorScheme="teal" type="submit" isDisabled>
              Start
            </Button>
          ) : startLivestreamObject.processing ? (
            <Button
              isLoading
              loadingText="Starting..."
              mt={4}
              ml={2}
              colorScheme="teal"
              type="submit"
            ></Button>
          ) : (
            <Button
              mt={4}
              ml={2}
              colorScheme="teal"
              type="submit"
              onClick={handleStartStream}
            >
              Start
            </Button>
          )}
        </Box>
      </Box>
      <Text
        fontSize="2xl"
        fontFamily="mono"
        marginLeft="6"
        marginRight="6"
        marginBottom="3"
        marginTop="3"
      >
        Active Streams
      </Text>
      {streamsNotEmpty ? (
        <Box margin="6">
          {streams.map(
            (value: { id: string; name: string; playbackId: string }) => (
              <Card
                direction={{ base: 'column', sm: 'row' }}
                overflow="hidden"
                variant="outline"
                marginTop="8"
                key={value.id!}
              >
                <Image
                  objectFit="cover"
                  maxW={{ base: '100%', sm: '200px' }}
                  src="https://images.unsplash.com/photo-1611162616475-46b635cb6868?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2874&q=80"
                  alt="Video Icon"
                />
                <Stack>
                  <CardBody>
                    <Heading size="md">{value.name}</Heading>
                  </CardBody>

                  <CardFooter>
                    {isConnected ? (
                      <Button
                        variant="solid"
                        colorScheme={'red'}
                        onClick={onOpen}
                      >
                        Join Stream
                      </Button>
                    ) : (
                      <ConnectButton label="Sign in" />
                    )}
                    <Modal isOpen={isOpen} onClose={onClose}>
                      <ModalOverlay />
                      <ModalContent>
                        <ModalHeader>{value.name}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                          <Player
                            title={value.name}
                            playbackId={value.playbackId}
                            autoPlay
                            muted
                          />
                        </ModalBody>

                        <ModalFooter>
                          <Button colorScheme="red" mr={3} onClick={onClose}>
                            Leave Stream
                          </Button>
                          {/* <Button variant="ghost">Secondary Action</Button> */}
                        </ModalFooter>
                      </ModalContent>
                    </Modal>
                  </CardFooter>
                </Stack>
              </Card>
            ),
          )}
        </Box>
      ) : (
        <Text fontSize="1xl" marginLeft="2" marginBottom="3" align="center">
          No active streams
        </Text>
      )}
    </Container>
  )
}
