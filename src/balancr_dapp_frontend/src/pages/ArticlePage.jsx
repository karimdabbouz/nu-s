import 'bootstrap/dist/css/bootstrap.min.css';
import * as React from 'react';
import { useState, useEffect } from 'react';

import { balancr_dapp_content } from '../../../declarations/balancr_dapp_content';



const ArticlePage = () => {

    const [comments, setComments] = useState([]);

    useEffect(() => {
        getComments();
    }, []);


    // Gets all proposals (for comments) regardless of their voting weight (including accepted ones)
    const getComments = async () => {
        const resultArray = [];
        const response = await balancr_dapp_content.getAllComments();
        console.log(response);
        for (var entry of response.values()) {
            const data = {
                id: Number(entry.id),
                articleID: Number(entry.articleID),
                creator: entry.creator.toText(),
                createdAt: entry.createdAt,
                headline: entry.headline,
                content: entry.content,
                url: entry.url
            };
            resultArray.push(data)
        };
        setComments(resultArray);
    };

    return (
        <>
            <div className="container-fluid above-the-fold">
                <div className="row w-75 p-lg-5 p-md-2 mx-auto">
                    <div className="col">
                        <p><italic>this is a dummy <a href="https://www.faz.net/aktuell/wirtschaft/digitec/150-millionen-menschen-in-europa-nutzen-tiktok-18687023.html">article</a></italic></p>
                        <img className="img-fluid" src="article_img.jpg"></img>
                        <p>KURZVIDEOS MIT KONJUNKTUR</p>
                        <h2>150 Millionen Menschen in Europa nutzen Tiktok</h2>
                        <h5>Die Nutzerzahlen der Video-Plattform scheinen nur eine Richtung zu kennen: Nach oben. Die chinesische Unternehmensmutter hat daher kräftig Belegschaft in Europa aufgebaut und plant weitere Datenzentren.</h5>
                        <p>Immer mehr Menschen in Europa scrollen durch die Kurzvideos auf der Plattform Tiktok . Am Freitag berichtete die Plattform, die zum chinesischen Internet-Konzern Bytedance gehört, mittlerweile sehen sich über 150 Millionen Nutzer in Europa jeden Monat Videos auf ihr an oder produzieren sie selbst. Bisher veröffentlichte die Plattform nur sporadisch Nutzerzahlen. Im Herbst 2021 berichtete sie zuletzt über globale Nutzerzahlen. Damals knackte Tiktok die Marke von einer Milliarde Nutzer auf der ganzen Welt. Seit Sommer 2020 waren rund 300 Millionen hinzugekommen.</p>
                        <p>Wie viele globale Nutzer Tiktok im Moment hat und welchen Anteil die 150 Millionen europäischen Nutzer ausmachen, ist nicht bekannt. Schätzungen gingen von 1,8 Milliarden Nutzern Ende 2022 aus. Tiktok wird als eine der am schnellsten wachsenden Plattformen unter den sozialen Medien gehandelt. Ein handfester Indikator dafür dürfte sein, dass in den europäischen Niederlassungen in den vergangenen Jahren stark Personal aufgebaut wurde. 2019 hatte die Niederlassung im Vereinigten Königreich, welche die Geschäfte für das selbige, den europäischen Wirtschaftsraum und die Schweiz verantwortete, 208 Mitarbeiter. Nunmehr arbeiten über 5000 Menschen in zehn europäischen Ländern für Tiktok, darunter auch in Deutschland.</p>
                        <p>In derselben Mitteilung erklärte Tiktok auch sein weiteres Vorgehen im Umgang mit europäischen Nutzerdaten. Zum einen will die Plattform neben einem geplanten Datenzentrum in Dublin zwei weitere solche Zentren aufbauen, die die Kapazitäten in Irland ergänzen sollen. Ein zweites ist in Irland geplant, für ein drittes führe man Gespräche. Hierdurch soll der Datenfluss europäischer Nutzer ins außereuropäische Ausland eingeschränkt werden. Bislang unterhielt Tiktok noch Datenzentren in den Vereinigten Staaten und Singapur.</p>
                        <h3>Datenschutzbedenken von allen Seiten</h3>
                        <p>Bytedance beteuert immer wieder, dass die Kommunistische Partei Chinas (KPC) keinen Zugriff auf die Daten von Tiktok-Nutzern hat. Die Daten der chinesischen Version von Tiktok, Douyin, sind von der internationalen Version abgetrennt. Richtig glauben mögen das Behörden dem Konzern allerdings nicht. Mehrere Mitglieder der EU-Kommission hatten den Chef des Unternehmens, Shou Zi Chew, direkt ermahnt, sich an europäische Daten- und Jugendschutzregeln zu halten, darunter Innenkommissarin Ylva Johansson und Binnenmarktkommissar Thierry Breton.</p>
                        <p>Auch in den Vereinigten Staaten wird Tiktok zunehmend kritisch beäugt. Ende vergangenen Jahres wurde es verboten, Tiktok auf Geräten zu installieren, die von der Bundesregierung ausgegeben werden. Der frühere Präsident Donald Trump versuchte 2020 gar die App im ganzen Land zu verbieten – vergeblich.</p>
                    </div>
                </div>
                {comments.map((entry) => (
                    <div className="row p-lg-5 p-md-2 mt-5 mx-auto border rounded maxwidth50">
                        <div className="col">
                            <h2>{entry.headline}</h2>
                            <h6><strong>by: </strong>{entry.creator}</h6>
                            <p>{entry.content}</p>
                        </div>
                    </div>
                ))}
                <div className="container-fluid">
                    <div className="row" style={{height: "200px"}}></div>
                </div>
            </div>
        </>
    )
  };

export default ArticlePage;