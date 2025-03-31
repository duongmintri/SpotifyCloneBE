import React from "react";
import { Row, Col } from "react-bootstrap";
import MusicCard from "./MusicCard";

const CardGrid = ({ title, songs, columns }) => {
  return (
    <>
      <h4 className="mt-4">{title}</h4>
      <Row>
        {songs.map((song, idx) => (
          <Col key={idx} md={12 / columns}>
            <MusicCard title={song} artist={song === "Inner Light" ? "Shocking Lemon" : "Artist Name"} />
          </Col>
        ))}
      </Row>
    </>
  );
};

export default CardGrid;